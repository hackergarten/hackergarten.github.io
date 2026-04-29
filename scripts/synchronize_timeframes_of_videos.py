import cv2
import numpy as np
from pathlib import Path

def get_video_info(video_path):
    """Extract video metadata"""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return {'fps': fps, 'frames': frame_count, 'width': width, 'height': height}

def find_frame_offset(video1_path, video2_path, sample_size=100):
    """
    Detect if one video lags behind the other by comparing frames.
    Returns the frame offset needed to align them.
    """
    cap1 = cv2.VideoCapture(video1_path)
    cap2 = cv2.VideoCapture(video2_path)
    
    max_offset = 0
    best_correlation = 0
    
    # Sample frames to find best alignment
    for offset in range(-sample_size, sample_size, 5):
        correlations = []
        
        for frame_num in range(50, min(200, min(
            int(cap1.get(cv2.CAP_PROP_FRAME_COUNT)),
            int(cap2.get(cv2.CAP_PROP_FRAME_COUNT))
        ))):
            cap1.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            cap2.set(cv2.CAP_PROP_POS_FRAMES, frame_num + offset)
            
            ret1, frame1 = cap1.read()
            ret2, frame2 = cap2.read()
            
            if ret1 and ret2:
                # Convert to grayscale and compute similarity
                gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
                gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
                
                correlation = cv2.matchTemplate(gray1, gray2[:, :gray1.shape[1]], 
                                               cv2.TM_CCOEFF)
                correlations.append(correlation)
        
        avg_correlation = np.mean(correlations) if correlations else 0
        
        if avg_correlation > best_correlation:
            best_correlation = avg_correlation
            max_offset = offset
    
    cap1.release()
    cap2.release()
    return max_offset

def synchronize_videos(video1_path, video2_path, output_dir='output'):
    """Main synchronization function"""
    Path(output_dir).mkdir(exist_ok=True)
    
    # Get metadata
    info1 = get_video_info(video1_path)
    info2 = get_video_info(video2_path)
    
    print(f"Video 1: {info1['fps']} fps, {info1['frames']} frames")
    print(f"Video 2: {info2['fps']} fps, {info2['frames']} frames")
    
    # Find frame offset
    print("Detecting frame offset...")
    offset = find_frame_offset(video1_path, video2_path)
    print(f"Frame offset detected: {offset} frames")
    
    # Determine target specifications
    target_fps = min(info1['fps'], info2['fps'])
    target_frames = min(info1['frames'], info2['frames']) - abs(offset)
    
    # Use FFmpeg to standardize both videos
    output1 = f"{output_dir}/video1_synced.mp4"
    output2 = f"{output_dir}/video2_synced.mp4"
    
    # Synchronize video 2 by removing leading frames if offset is positive
    trim_start = max(0, offset)
    
    os.system(f'ffmpeg -i "{video1_path}" -r {target_fps} -vf "fps={target_fps}" '
              f'-t {target_frames / target_fps} -c:v libx264 -crf 23 "{output1}"')
    
    os.system(f'ffmpeg -i "{video2_path}" -r {target_fps} -ss {trim_start / target_fps} '
              f'-vf "fps={target_fps}" -t {target_frames / target_fps} -c:v libx264 '
              f'-crf 23 "{output2}"')
    
    print(f"Synchronized videos saved to {output_dir}")
