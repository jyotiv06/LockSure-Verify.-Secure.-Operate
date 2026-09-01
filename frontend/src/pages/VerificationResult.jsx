import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import api from "../services/api";


function VerificationResult() {
  const navigate = useNavigate();

  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const finalizeVerification = async () => {

      const verificationId =
        localStorage.getItem("verificationId");


      if (!verificationId) {

        setError(
          "Verification session not found. Please start verification again."
        );

        setLoading(false);

        return;
      }


      try {

        setLoading(true);
        setError("");


        const response = await api.post(
          `/verification/${verificationId}/finalize`
        );


        console.log(
          "Final verification result:",
          response.data
        );


        setVerificationData(
          response.data
        );


      } catch (error) {

        console.error(
          "Failed to finalize verification:",
          error
        );


        setError(
          error.response?.data?.detail ||
          "Failed to finalize verification."
        );


      } finally {

        setLoading(false);

      }

    };


    finalizeVerification();

  }, []);


  // Loading screen
  if (loading) {

    return (

      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <main className="max-w-3xl mx-auto px-6 py-8">

          <Card>

            <div className="py-16 text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="mt-4 text-gray-600">

                Finalizing verification...

              </p>

            </div>

          </Card>

        </main>

      </div>

    );

  }


  // Error screen
  if (error) {

    return (

      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <main className="max-w-3xl mx-auto px-6 py-8">

          <Card>

            <div className="py-10 text-center">

              <div className="text-5xl mb-4">
                ❌
              </div>


              <h2 className="text-2xl font-bold text-red-700">

                Verification Failed

              </h2>


              <p className="text-gray-500 mt-3">

                {error}

              </p>


              <div className="mt-6">

                <Button
                  onClick={() =>
                    navigate("/officer/verification")
                  }
                >
                  Start Again
                </Button>

              </div>

            </div>

          </Card>

        </main>

      </div>

    );

  }


  /*
    Backend state examples:

    INITIATED
    DOCUMENT_VERIFIED
    FACE_VERIFIED
    APPROVED
    REJECTED

    Adjust these if your service.py uses
    different state names.
  */

  const isDocumentVerified =
    verificationData?.document_match === true;


  const isFaceVerified =
    verificationData?.face_match === true;


  const isApproved =
    verificationData?.state === "APPROVED" ||
    verificationData?.state === "COMPLETED";


  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />


      <main className="max-w-3xl mx-auto px-6 py-8">


        {/* Heading */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-4">

            {isApproved ? "✅" : "⚠️"}

          </div>


          <h2 className="text-3xl font-bold text-gray-800">

            {isApproved
              ? "Verification Successful"
              : "Verification Review"}

          </h2>


          <p className="text-gray-500 mt-2">

            {isApproved
              ? "Verification has been successfully completed."
              : "Verification requires additional review."}

          </p>


          {/* Show backend state */}

          <p className="mt-3 text-xs text-gray-400">

            Verification Status:{" "}

            <span className="font-semibold">

              {verificationData?.state ||
                "UNKNOWN"}

            </span>

          </p>

        </div>


        {/* Result Card */}

        <Card>


          <h3 className="text-xl font-semibold text-gray-800 mb-6">

            Verification Results

          </h3>


          <div className="space-y-5">


            {/* Document */}

            <div className="flex justify-between items-center border-b pb-4">

              <div>

                <p className="font-medium text-gray-800">

                  Document Verification

                </p>


                <p className="text-sm text-gray-500">

                  {isDocumentVerified
                    ? "Identity document successfully verified."
                    : "Document verification failed or is incomplete."}

                </p>

              </div>


              <StatusBadge
                status={
                  isDocumentVerified
                    ? "Verified"
                    : "Pending"
                }
              />

            </div>


            {/* Face */}

            <div className="flex justify-between items-center border-b pb-4">

              <div>

                <p className="font-medium text-gray-800">

                  Face Verification

                </p>


                <p className="text-sm text-gray-500">

                  {isFaceVerified
                    ? "Face successfully matched with customer data."
                    : "Face verification failed or is incomplete."}

                </p>

              </div>


              <StatusBadge
                status={
                  isFaceVerified
                    ? "Verified"
                    : "Pending"
                }
              />

            </div>


            {/* Final Decision */}

            <div className="flex justify-between items-center">

              <div>

                <p className="font-medium text-gray-800">

                  Final Verification Decision

                </p>


                <p className="text-sm text-gray-500">

                  {isApproved
                    ? "All verification checks have been approved."
                    : "Verification has not been approved yet."}

                </p>

              </div>


              <StatusBadge
                status={
                  isApproved
                    ? "Verified"
                    : "Pending"
                }
              />

            </div>


          </div>


          {/* Continue */}

          <div className="mt-8 flex justify-end">

            <Button
              disabled={!isApproved}
              onClick={() =>
                navigate(
                  `/locker-status?verification=${verificationData?.verification_id}`
                )
              }
            >

              Continue to Locker Operation

            </Button>

          </div>


        </Card>


      </main>

    </div>

  );

}


export default VerificationResult;