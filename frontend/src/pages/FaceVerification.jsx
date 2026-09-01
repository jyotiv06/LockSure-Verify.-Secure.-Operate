import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";

import api from "../services/api";


function FaceVerification() {
  const navigate = useNavigate();

  const [cameraOpen, setCameraOpen] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verificationResult, setVerificationResult] =
    useState(null);


  const handleCameraToggle = () => {
    setCameraOpen(!cameraOpen);

    if (cameraOpen) {
      setFaceCaptured(false);
    }

    setError("");
  };


  const handleCaptureFace = () => {
    if (!cameraOpen) {
      setError("Please open the camera first.");
      return;
    }

    setFaceCaptured(true);
    setError("");
    setVerificationResult(null);
  };


  const handleVerification = async () => {

    const verificationId =
      localStorage.getItem("verificationId");


    if (!verificationId) {
      setError(
        "Verification session not found. Please start verification again."
      );

      return;
    }


    if (!faceCaptured) {
      setError(
        "Please capture the face before verification."
      );

      return;
    }


    try {

      setVerifying(true);
      setError("");


      /*
        Current backend expects:

        {
          "face_match": true
        }

        Actual camera/image processing
        can be added later.
      */

      const response = await api.post(
        `/verification/${verificationId}/face`,
        {
          face_match: true,
        }
      );


      console.log(
        "Face verification result:",
        response.data
      );


      setVerificationResult(
        response.data
      );


      setCameraOpen(false);


    } catch (error) {

      console.error(
        "Face verification error:",
        error
      );


      setError(
        error.response?.data?.detail ||
        "Face verification failed."
      );


    } finally {

      setVerifying(false);

    }

  };


  const handleContinue = () => {

    if (!verificationResult) {
      setError(
        "Please complete face verification first."
      );

      return;
    }


    navigate("/verification-result");

  };


  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />


      <main className="mx-auto max-w-4xl px-6 py-8">


        {/* Heading */}

        <div className="mb-6">

          <h2 className="text-3xl font-bold text-gray-800">
            Face Verification
          </h2>


          <p className="mt-2 text-gray-500">
            Capture and verify the customer's face to complete
            identity verification.
          </p>

        </div>


        {/* Error */}

        {error && (

          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle size={20} />

            {error}

          </div>

        )}


        {/* Success */}

        {verificationResult && (

          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

            <CheckCircle2 size={20} />

            Face verification completed successfully.

          </div>

        )}


        <Card>


          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            Face Capture
          </h3>


          <p className="mb-5 text-sm text-gray-500">
            Position the customer's face inside the camera frame.
          </p>


          {/* Camera Area */}

          <div className="flex h-80 flex-col items-center justify-center rounded-xl bg-gray-900 text-white">


            {verifying ? (

              <>

                <Loader />

                <p className="mt-3">
                  Verifying face...
                </p>

              </>

            ) : cameraOpen ? (

              <>

                <Camera
                  size={48}
                  className="mb-4 text-blue-400"
                />


                <div className="flex h-48 w-40 items-center justify-center rounded-full border-2 border-dashed border-white">

                  <span className="text-gray-400">
                    Face
                  </span>

                </div>


                {faceCaptured ? (

                  <div className="mt-4 flex items-center gap-2 text-green-400">

                    <CheckCircle2 size={18} />

                    Face captured successfully

                  </div>

                ) : (

                  <p className="mt-4 text-sm text-gray-400">
                    Position face and click Capture Face
                  </p>

                )}

              </>

            ) : (

              <>

                <Camera
                  size={48}
                  className="mb-4 text-gray-400"
                />


                <p>
                  Camera is currently closed
                </p>

              </>

            )}


          </div>


          {/* Camera Controls */}

          {!verifying && (

            <div className="mt-5 flex flex-wrap gap-3">


              <Button
                variant="secondary"
                onClick={handleCameraToggle}
                disabled={verificationResult}
              >

                {cameraOpen
                  ? "Close Camera"
                  : "Open Camera"}

              </Button>


              {cameraOpen && (

                <Button
                  variant="secondary"
                  onClick={handleCaptureFace}
                  disabled={
                    faceCaptured ||
                    verificationResult
                  }
                >

                  {faceCaptured
                    ? "Face Captured"
                    : "Capture Face"}

                </Button>

              )}


              {cameraOpen && (

                <div className="ml-auto">

                  <Button
                    onClick={handleVerification}
                    disabled={
                      !faceCaptured ||
                      verifying ||
                      verificationResult
                    }
                  >

                    {verifying
                      ? "Verifying..."
                      : verificationResult
                        ? "Face Verified"
                        : "Verify Face"}

                  </Button>

                </div>

              )}


            </div>

          )}


          {/* Continue */}

          {verificationResult && (

            <div className="mt-6 flex justify-end">

              <Button
                onClick={handleContinue}
              >

                Continue to Result

              </Button>

            </div>

          )}


        </Card>


      </main>


    </div>

  );
}


export default FaceVerification;