import json
from unicodedata import name
from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random
import time
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

def getToken(request):
    
    appId = 'c0b140fce0e844d1b9795dba24e24d3b'
    appCertificate= '44bb9051ad884c2eba1eccdf33a07a30'
    channelName = request.GET.get('channel')
    uid = random.randint(1,230)

    #setting expiring time
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds

    #role =1 for host, role = 2 for guests ..(dont matter as we not dealing with authentication )
    role =1


    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid}, safe=False)

def lobby(request):
    return render(request, 'main/lobby.html')

def room(request):
    return render(request, 'main/room.html')

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)

    member,created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name']
    )

    return JsonResponse({'name':data['name']},safe=False)

def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(uid=uid,room_name=room_name)
    name = member.name

    return JsonResponse({'name':name},safe=False)