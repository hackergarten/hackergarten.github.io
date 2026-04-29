import cv2
import numpy as np
from pathlib import Path

def create_difference_video(video1_path, video2_path, output_path='difference.mp4', 
                           diff_method='absolute', threshold=None):
    """
    Create a video showing the difference between two synchronized videos.
    
    Args:
        video1_path: Path to first synchronized video
        video2_path: Path to second synchronized video
        output_path: Path for the output difference video
        diff_method: 'absolute', 'squared', or 'optical_flow'
        threshold: Minimum pixel difference to display (0-255). 
                  Pixels below threshold become black.
    """
    
    # Open both videos
    cap1 = cv2.VideoCapture(video1_path)
    cap2 = cv2.VideoCapture(video2_path)
    
    # Get video properties
    fps = cap1.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap1.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap1.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap1.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Creating difference video: {width}x{height} @ {fps} fps, {frame_count} frames")
    
    # Define codec and create VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    frame_num = 0
    
    while True:
        ret1, frame1 = cap1.read()
        ret2, frame2 = cap2.read()
        
        if not ret1 or not ret2:
            break
        
        # Compute difference based on method
        if diff_method == 'absolute':
            # Simple absolute difference
            diff = cv2.absdiff(frame1, frame2)
        
        elif diff_method == 'squared':
            # Squared difference (emphasizes larger differences)
            diff = np.square(frame1.astype(np.float32) - frame2.astype(np.float32))
            diff = np.clip(diff / 1000, 0, 255).astype(np.uint8)
        
        elif diff_method == 'optical_flow':
            # Grayscale for optical flow
            gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
            
            flow = cv2.calcOpticalFlowFarneback(gray1, gray2, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            
            # Normalize magnitude to 0-255
            magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)
            diff = cv2.cvtColor(magnitude.astype(np.uint8), cv2.COLOR_GRAY2BGR)
        
        # Apply threshold if specified
        if threshold is not None:
            # Only show differences above threshold
            gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            mask = gray_diff > threshold
            diff[~mask] = [0, 0, 0]
        
        # Write frame to output video
        out.write(diff)
        
        frame_num += 1
        if frame_num % 30 == 0:
            print(f"Processed {frame_num}/{frame_count} frames")
    
    # Release all resources
    cap1.release()
    cap2.release()
    out.release()
    
    print(f"Difference video saved to: {output_path}")

# Usage example
if __name__ == "__main__":
    create_difference_video(
        'output/video1_synced.mp4',
        'output/video2_synced.mp4',
        'output/difference.mp4',
        diff_method='absolute',
        threshold=10  # Only show differences > 10 intensity units
    )
