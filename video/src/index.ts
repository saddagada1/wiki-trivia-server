import dotenv from "dotenv";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import amqp from "amqplib";
import path from "path";
import { Quiz } from "./lib/types";
import fs from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";

dotenv.config();

const makePathSafe = (path: string) => {
  const unsafeCharsRegex = /[^a-zA-Z0-9_.\-]/g;
  return path.replace(unsafeCharsRegex, "_");
};

const saveVideo = async ({ name, path }: { name: string; path: string }) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_KEY!,
      secretAccessKey: process.env.S3_SECRET!,
    },
    region: process.env.S3_REGION!,
  });

  const key = `videos/${name}.mp4`;

  const params = {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: fs.createReadStream(path),
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return process.env.CLOUDFRONT_URL! + key;
};

const main = async () => {
  const client = new MongoClient(
    `mongodb://${process.env.MONGO_HOST}:${parseInt(process.env.MONGO_PORT!)}`
  );

  try {
    await client.connect();
  } catch (error) {
    console.log(error);
  }

  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection(process.env.MONGO_COLLECTION!);

  const connection = await amqp.connect(`amqp://${process.env.RABBIT_MQ_HOST}`);
  const channel = await connection.createChannel();

  const videoQueue = process.env.VIDEO_QUEUE!;
  await channel.assertQueue(videoQueue, { durable: true });

  const notificationsQueue = process.env.NOTIFICATIONS_QUEUE!;
  await channel.assertQueue(notificationsQueue, { durable: true });

  console.log("Waiting for messages...");
  channel.consume(videoQueue, async (msg) => {
    if (msg !== null) {
      console.log("Got a new quiz...");

      const quiz = JSON.parse(msg.content.toString()) as Quiz;
      const name = makePathSafe(quiz.topic);

      const props = { quiz };
      const compositionId = "Trivia";

      console.log("Bundling...");
      const bundleLocation = await bundle({
        entryPoint: path.resolve("./src/remotion/index.ts"),
        webpackOverride: (config) => config,
      });

      console.log("Selecting composition...");
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: props,
      });

      console.log("Video Started Rendering!");

      channel.publish(
        "",
        notificationsQueue,
        Buffer.from(JSON.stringify({ status: "Rendering video..." })),
        { persistent: true }
      );

      const outputLocation = path.resolve(`./videos/${name}.mp4`);

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation,
        overwrite: true,
        inputProps: props,
        logLevel: "verbose",
        chromiumOptions: {
          enableMultiProcessOnLinux: true,
        },
        timeoutInMilliseconds: 120000,
      });

      console.log("Video Created!");

      console.log("Saving to S3...");

      try {
        const url = await saveVideo({ name, path: outputLocation });
        console.log("Video Saved!");

        const now = new Date().getTime();
        await collection.updateOne(
          quiz,
          { $set: { ...quiz, url, createdAt: now } },
          { upsert: true }
        );
      } catch (error) {
        console.log(error);
        channel.nack(msg);
      }

      console.log("Video Saved and Updated!");

      channel.publish(
        "",
        notificationsQueue,
        Buffer.from(JSON.stringify({ status: "completed" })),
        {
          persistent: true,
        }
      );

      channel.ack(msg);
    }
  });

  process.on("SIGINT", () => {
    console.log("Received SIGINT. Cleaning up and exiting...");
    cleanup();
  });

  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Cleaning up and exiting...");
    cleanup();
  });

  const cleanup = async () => {
    await client.close();
    await channel.close();
    await connection.close();
  };
};

main().catch((err) => console.error(err));
