import dotenv from "dotenv";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import amqp from "amqplib";
import path from "path";
import { Quiz, Styles } from "./lib/types";
import { CSSProperties } from "react";
import fs from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";

dotenv.config();

const backgrounds = [
  `background: linear-gradient(115deg, #FF9797 0%, #0F0068 100%), linear-gradient(245deg, #A8FFE5 0%, #0500FF 100%), radial-gradient(100% 225% at 100% 0%, #FF003D 0%, #000000 100%), radial-gradient(90% 160% at 0% 100%, #E42C64 0%, #E42C64 30%, #614AD3 calc(30% + 1px), #614AD3 60%, #2D248A calc(60% + 1px), #2D248A 70%, #121B74 calc(70% + 1px), #121B74 100%), linear-gradient(100deg, #48466F 9%, #48466D 35%, #3D84A8 calc(35% + 1px), #3D84A8 65%, #46CDCF calc(65% + 1px), #46CDCF 70%, #ABEDD8 calc(70% + 1px), #ABEDD8 100%);
  background-blend-mode: overlay, overlay, overlay, overlay, normal;`,
  `background: linear-gradient(50.22deg, #0066FF 0%, #FFAA7A 51.63%), linear-gradient(238.72deg, #FF0000 0%, #000000 100%), linear-gradient(301.28deg, #FF0000 0%, #735A00 100%), linear-gradient(121.28deg, #207A00 0%, #950000 100%), linear-gradient(238.72deg, #FFB800 0%, #000000 100%), linear-gradient(238.72deg, #00D1FF 0%, #00FF38 100%), linear-gradient(58.72deg, #B80000 0%, #1B00C2 100%), linear-gradient(125.95deg, #00E0FF 10.95%, #87009D 100%), linear-gradient(263.7deg, #B60000 3.43%, #B100A0 96.57%), linear-gradient(130.22deg, #DBFF00 18.02%, #3300FF 100%);
  background-blend-mode: multiply, color-dodge, difference, color-dodge, difference, lighten, difference, color-dodge, difference, normal;`,
  `background: linear-gradient(238.72deg, #FFB864 0%, #006C4C 100%), radial-gradient(100% 224.43% at 0% 0%, #FCC482 0%, #002E74 100%), linear-gradient(121.28deg, #FFEAB6 0%, #00563C 100%), linear-gradient(229.79deg, #7534FF 0%, #248900 94.19%), radial-gradient(56.26% 101.79% at 50% 0%, #8F00FF 0%, #493500 100%), linear-gradient(65.05deg, #6F0072 0%, #FFD600 100%);
  background-blend-mode: overlay, screen, color-burn, hard-light, screen, normal;`,
  `background: linear-gradient(238.72deg, #FFC6C6 0%, #1F1818 100%), linear-gradient(301.28deg, #DB00FF 0%, #735A00 100%), linear-gradient(121.28deg, #207A00 0%, #950000 100%), linear-gradient(238.72deg, #FFB800 0%, #000000 100%), linear-gradient(238.72deg, #00D1FF 0%, #00FF38 100%), linear-gradient(58.72deg, #B80000 0%, #1B00C2 100%), linear-gradient(121.5deg, #00E0FF -0.26%, #87009D 100%), linear-gradient(263.7deg, #FF9900 3.43%, #740068 96.57%), linear-gradient(130.22deg, #DBFF00 18.02%, #3300FF 100%);
  background-blend-mode: color-dodge, difference, color-dodge, difference, lighten, difference, color-dodge, difference, normal;`,
  `background: radial-gradient(65% 100% at 50% 0%, #18005B 0%, #000000 100%), radial-gradient(circle at 30% 45%, #FF0000 0%, #FF0000 5%, #FFFF00 5%, #FFFF00 10%, #00FF00 10%, #00FF00 15%, #00FFFF 15%, #00FFFF 20%, #0000FF 20%, #0000FF 30%, #FF00FF 30%, #FF00FF 40%, #FF0000 40%), radial-gradient(circle at 50% 0%, #FF0000 0%, #FF0000 5%, #FFFF00 5%, #FFFF00 10%, #00FF00 10%, #00FF00 20%, #00FFFF 20%, #00FFFF 30%, #0000FF 30%, #0000FF 40%, #FF00FF 40%, #FF00FF 50%, #FF0000 50%), conic-gradient(from 15deg at 20% 420%, #FF0000 0deg, #FF0000 55deg, #FFFF00 60deg, #FFFF00 120deg, #00FF00 120deg, #00FF00 180deg, #00FFFF 180deg, #00FFFF 240deg, #0000FF 240deg, #0000FF 300deg, #FF00FF 310deg, #FF00FF 360deg, #FF0000 360deg);
  background-blend-mode: screen, multiply, multiply, normal;`,
  `background: linear-gradient(115deg, #000000 0%, #00C508 55%, #000000 100%), linear-gradient(115deg, #0057FF 0%, #020077 100%), conic-gradient(from 110deg at -5% 35%, #000000 0deg, #FAFF00 360deg), conic-gradient(from 220deg at 30% 30%, #FF0000 0deg, #0000FF 220deg, #240060 360deg), conic-gradient(from 235deg at 60% 35%, #0089D7 0deg, #0000FF 180deg, #240060 360deg);
  background-blend-mode: soft-light, soft-light, overlay, screen, normal;`,
  `background: radial-gradient(65% 100% at 50% 0%, #00FF94 0%, rgba(0, 255, 148, 0.25) 100%), linear-gradient(230deg, #000000 25%, #170059 100%), linear-gradient(215deg, #FFEBB9 10%, #19004E 80%), radial-gradient(100% 245% at 100% 100%, #FFFFFF 0%, #000353 100%), linear-gradient(125deg, #1400FF 0%, #3A0000 100%), linear-gradient(225deg, #00F0FF 30%, #000B6F 45%, #00EBFC 45%, #001676 65%, #00E1F6 65%, #001676 85%, #00ECFD 85%, #001676 100%), linear-gradient(135deg, #00F0FF 0%, #000B6F 15%, #00EBFC 15%, #001676 35%, #00E1F6 35%, #001676 55%, #00ECFD 55%, #001676 100%);
  background-blend-mode: soft-light, screen, overlay, overlay, difference, overlay, normal;`,
  `background: linear-gradient(153.03deg, #0500FF 16.92%, #000000 87.01%), linear-gradient(121.28deg, #FFFFFF 70.31%, rgba(25, 0, 177, 0.85) 100%), linear-gradient(195.81deg, #FFB6B6 8.74%, #00492F 100%), linear-gradient(269.62deg, #FFFFFF 0.44%, #0077AA 99.56%), radial-gradient(77.85% 100% at 50% 0%, #6BFF71 0%, #190024 100%), linear-gradient(339.45deg, #00FF38 1.34%, #FF0000 73.07%), linear-gradient(201.13deg, #22F400 -0.47%, #DBFF00 100%), linear-gradient(94.04deg, #18007A 0%, #00D5C8 51.04%, #F4FF75 100%), #FFFFFF;
  background-blend-mode: exclusion, multiply, overlay, multiply, color-dodge, difference, difference, normal, normal;`,
];

const rand = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const makePathSafe = (path: string) => {
  const unsafeCharsRegex = /[^a-zA-Z0-9_.\-]/g;
  return path.replace(unsafeCharsRegex, "_");
};

const cssToInline = (css: string): CSSProperties => {
  const rules: string[] = css.split(";");

  return rules.reduce((prev, curr) => {
    const [property, value] = curr.split(":").map((part) => part.trim());
    const camelCaseProperty: keyof CSSProperties = property.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    ) as keyof CSSProperties;
    if (camelCaseProperty && value) {
      prev[camelCaseProperty] = value;
    }
    return prev;
  }, {} as Styles) as CSSProperties;
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

  await client.connect();

  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection(process.env.MONGO_COLLECTION!);

  const connection = await amqp.connect(`amqp://${process.env.RABBIT_MQ_HOST}`);
  const channel = await connection.createChannel();

  const queueName = process.env.VIDEO_QUEUE!;
  await channel.assertQueue(queueName, { durable: true });

  console.log("Waiting for messages...");
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      console.log("Got a new quiz...");

      const quiz = JSON.parse(msg.content.toString()) as Quiz;
      const css = cssToInline(backgrounds[rand(0, backgrounds.length - 1)]);
      const name = makePathSafe(quiz.topic);

      const props = { quiz, bg: css };
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
        await collection.updateOne(quiz, { $set: { ...quiz, url } }, { upsert: true });
      } catch (error) {
        console.log(error);
        channel.nack(msg);
      }

      console.log("Video Saved and Updated!");

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
