const APP_ID = 'c0b140fce0e844d1b9795dba24e24d3b'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))

let NAME = sessionStorage.getItem('name')

console.log('Stream.js connected')

const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})

let localTracks=[]
let remoteUsers={}

let joinAndDisplayLocalStream = async() => {

    //display roomname to make sure session values are working
    document.getElementById('room-name').innerText = CHANNEL

    // subscribe to event listener
    // whenever user publishes their track, handleUserJoined is called
    client.on('user-published', handleUserJoined)

    //handling user leave
    client.on('user-left',handleUserLeft)

    // join channel
    try{
        await client.join(APP_ID,CHANNEL,TOKEN,UID)
    }catch(error){
        console.error(error)
        window.open('/','_self')
    }
    

    // get audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    //creating user in db
    let member = await createMember()
    console.log('member',member)

    // create a player
    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div> 
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    //append the player to video-streams
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    // call the play method
    localTracks[1].play(`user-${UID}`)

    //publish track
    await client.publish([localTracks[0],localTracks[1]])
}

//handling user joining
let handleUserJoined = async (user,mediaType)=>{

    // adding user to remote user
    remoteUsers[user.uid] = user

    //local client subscribe to this user
    await client.subscribe(user,mediaType)


    if(mediaType==='video'){
        //checking if player already exists(user rejoining refreshing) then we remove that player
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player!=null){
            player.remove()
        }

        let member = await getMember(user)
        // create a player
        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div> 
                    <div class="video-player" id="user-${user.uid}"></div>
                </div>`

        //append the player to video-streams
        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

        // call the play method
        console.log("subscribe video success");
        user.videoTrack.play(`user-${user.uid}`)

    }

    if (mediaType==='audio'){
        user.audioTrack.play()
    }
}

//handling user leaves
let handleUserLeft = async(user)=>{
    //removing leaving user using uid
    delete remoteUsers[user.uid]

    //removing user from DOM
    document.getElementById(`user-container-${user.uid}`).remove()
}

//leave button in video controls
let leaveAndRemoveLocalStream = async()=>{

    //go through localtracks and stop tracks and close 
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()

    }

    //unsubscribe from chaneel we joined and redirect user back to lobby page
    await client.leave()
    //deleting member from db
    deleteMember()  
    window.open("/","_self")

}

//camera on/off in video controls
let toggleCamera = async(e)=>{
    //if already muted
    if (localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    // if on already
    else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255,80,80,1)'
    }
}

//audio on/off in video controls
let toggleMic = async(e) =>{
    //if already muted
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    //if on already
    else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255,80,80,1)'
    }

}

//create user in db
let createMember = async()=>{
    let response = await fetch('/create_member/',{
        method : 'POST',
        headers : {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            'name':NAME,
            'room_name':CHANNEL,
            'UID':UID,
        })
    })
    let member = await response.json()
    return member
}

//get user info from db
let getMember = async(user)=>{
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

//delete user from db
let deleteMember = async()=>{
    let response = await fetch('/delete_member/',{
        method : 'POST',
        headers : {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            'name':NAME,
            'room_name':CHANNEL,
            'UID':UID,
        })
    })
    let member = await response.json()
}


joinAndDisplayLocalStream()

//deleting member form db when user closes browser/page
window.addEventListener('beforeunload',deleteMember)

//adding event listener to leave button in video controls
document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream)

//adding event listener to camera button in video controls
document.getElementById('camera-btn').addEventListener('click',toggleCamera)

//adding event listener to audio button in video controls
document.getElementById('mic-btn').addEventListener('click',toggleMic)