const APP_ID = 'c0b140fce0e844d1b9795dba24e24d3b'
const CHANNEL = 'main'
const TOKEN = '006c0b140fce0e844d1b9795dba24e24d3bIAAuITf9xxWEuVowwRGULdX/sKe8ounLSWJwEQdKSD6DRWTNKL8AAAAAEABqGbu4Vn07YgEAAQBWfTti'
let UID;

console.log('Stream.js connected')

const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})

let localTracks=[]
let remoteUsers={}

let joinAndDisplayLocalStream = async() => {
    // join channel
    UID = await client.join(APP_ID,CHANNEL,TOKEN,null)

    // get audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    // create a player
    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">My Name</span></div> 
                    <div class="video-player" id="user-${UID}"></div>
                </div>`
    //append the player to video-streams
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    // play the method
    localTracks[1].play(`user-${UID}`)

    //publish track
    await client.publish([localTracks[0],localTracks[1]])
}

joinAndDisplayLocalStream()