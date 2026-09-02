import cv2

camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("ERROR: Could not open webcam")
    exit()

print("Webcam opened successfully!")
print("Press Q to quit.")

while True:
    ret, frame = camera.read()

    if not ret:
        print("ERROR: Could not read frame")
        break

    cv2.imshow("Webcam Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()