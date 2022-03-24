from django.db import models

# Create your models here.

#create database table RoomMember | username, uid, room name
#whenever user joins, create entry
#on handleUserJoin event,query db for room member name using uid
#on leave, delete RoomMember

class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    room_name = models.CharField(max_length=200)

    def __str__(self):
        return self.name