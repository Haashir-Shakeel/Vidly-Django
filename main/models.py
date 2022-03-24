from django.db import models

# Create your models here.

#create database table RoomMember | username, uid, roomname
#whenever user joins, create entry
#on handleUserJoin event,query db for room member name using uid
#on leave, delete RoomMember
