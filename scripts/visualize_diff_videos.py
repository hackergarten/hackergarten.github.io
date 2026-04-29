def create_color_coded_difference_video(video1_path, video2_path, output_path='difference_colored.mp4'):
    """
    Create a video where differences are color-coded:
    - Red: pixels brighter in video1
    - Blue: pixels brighter in video2
    - Black: identical pixels
    """
    
    cap1 = cv2.VideoCapture(video1_path)
    cap2 = cv2.VideoCapture(video2_path)
    
    fps = cap1.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap1.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap1.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap1.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    frame_num = 0
    
    while True:
        ret1, frame1 = cap1.read()
        ret2, frame2 = cap2.read()
        
        if not ret1 or not ret2:
            break
        
        # Create empty output frame (BGR)
        output_frame = np.zeros_like(frame1)
        
        # Calculate per-channel differences
        diff = frame1.astype(np.int16) - frame2.astype(np.int16)
        
        # Red channel: where frame1 is brighter
        output_frame[:, :, 2] = np.clip(diff * 2, 0, 255)
        
        # Blue channel: where frame2 is brighter
        output_frame[:, :, 0] = np.clip(-diff * 2, 0, 255)
        
        out.write(output_frame.astype(np.uint8))
        
        frame_num += 1
        if frame_num % 30 == 0:
            print(f"Processed {frame_num}/{frame_count} frames")
    
    cap1.release()
    cap2.release()
    out.release()
    
    print(f"Color-coded difference video saved to: {output_path}")
