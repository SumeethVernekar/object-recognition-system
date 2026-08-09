import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './WebcamDetector.css';

const API_URL = import.meta.env.VITE_API_URL;

function WebcamDetector({ token }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // back camera by default
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [detections, setDetections] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startCamera = async (mode) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setError('');
    } catch (err) {
      setError('Camera access denied or unavailable');
    }
  };

  // Detect whether this device actually has more than one camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const cameras = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(cameras.length > 1);
    });
  }, []);

  useEffect(() => {
    if (!capturedImage) startCamera(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, [facingMode, capturedImage]);

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64Image);
    setDetections([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      setDetections([]);
    };
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!capturedImage) return;
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(
        `${API_URL}/api/detect`,
        { image: capturedImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetections(res.data.objects || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDetections([]);
    setError('');
  };

  return (
    <div className="detector-layout">
      <div>
        <div className={`viewfinder ${capturedImage ? 'captured' : ''} ${loading ? 'scanning' : ''}`}>
          {!capturedImage ? (
            <video ref={videoRef} autoPlay muted playsInline />
          ) : (
            <img src={capturedImage} alt="Captured" />
          )}
          <div className="bracket tl" /><div className="bracket tr" />
          <div className="bracket bl" /><div className="bracket br" />
          <span className={`viewfinder-tag ${loading ? 'scanning-tag' : ''}`}>
            {loading ? 'Scanning…' : capturedImage ? 'Ready' : 'Live'}
          </span>
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!capturedImage ? (
          <div className="controls-row">
            <button className="btn-capture" onClick={handleCapture}>Capture Photo</button>
            {hasMultipleCameras && (
              <button className="btn-secondary" onClick={handleSwitchCamera}>
                {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
              </button>
            )}
            <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>Upload</button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="controls-row">
            <button className="btn-capture" onClick={handleDetect} disabled={loading}>
              {loading ? 'Detecting…' : 'Detect Objects'}
            </button>
            <button className="btn-secondary" onClick={handleRetake} disabled={loading}>Retake</button>
          </div>
        )}
        {error && <p className="status-line">{error}</p>}
      </div>

      <div className="results-panel">
        <h3>Detected Objects</h3>
        {loading && <p className="result-empty">Reading image…</p>}
        {!loading && detections.length === 0 && (
          <p className="result-empty">No results yet. Capture or upload a photo, then run detection.</p>
        )}
        {!loading && detections.map((obj, i) => (
          <div key={i} className="result-item">
            <span className="result-label">{obj.label}</span>
            <span className="result-meta">{obj.confidence}</span>
            <span className="result-desc">{obj.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebcamDetector;