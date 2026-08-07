import {useRef , useEffect, useState} from 'react';
import axios from 'axios';

function WebcamDetector({token}){
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [detections , setDetections] = usestate([]);
    const [ loading, setLoading] = usestate(false);

    useEffect(()=>{
        navigatior.mediaDevices.getUserMedia({video : true})
        .then(stream => {
            videoRef.current.srcObject = stream;
        })
        .catch(err => console.error('webcam access denied: ',err));
    },[]);

     useEffect(() => {
    const interval = setInterval(() => {
      captureAndDetect();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const captureAndDetect = async () => {
    if (!videoRef.current || loading) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const base64Image = canvas.toDataURL('image/jpeg', 0.7); 

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/detect`,
        { image: base64Image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetections(res.data.objects || []);
    } catch (err) {
      console.error('Detection failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div>
        <h3>Detected Objects {loading && '(scanning...)'}</h3>
        <ul>
          {detections.map((obj, i) => (
            <li key={i}>
              <strong>{obj.label}</strong> — {obj.confidence} confidence
              <br /><span style={{ color: '#666' }}>{obj.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WebcamDetector;