from rest_framework import serializers;
from django.contrib.auth.models import User;

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        model._meta.get_field('email')._unique = True
        fields = ['id', 'email', 'username', 'first_name']