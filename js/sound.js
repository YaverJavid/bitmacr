class SoundFeedback{
    constructor(audioPath, vibrate = false){
        this.audioPath = audioPath;
        this.vibrate = vibrate
    }
    play(forcefullyVibrate = this.vibrate){
        SoundFeedback.playSound(this.audioPath)
        if (forcefullyVibrate && navigator.vibrate) navigator.vibrate(200)
    }
    static playSound(audioPath) {
        let audio = new Audio(audioPath);
        audio.play();
    }
}

const saveSound = new SoundFeedback("audio/effect.save.wav")
const deleteSound = new SoundFeedback("audio/effect.delete.wav")
const CIDSound = new SoundFeedback("audio/effect.cid.wav")
