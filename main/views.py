from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random
import time
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
