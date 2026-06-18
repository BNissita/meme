import React, { useEffect, useState, useRef } from "react";
import { api } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const InterviewCallPage = () => {
    const [tavusUrl, setTavusUrl] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const hasCreated = useRef(false);

    useEffect(() => {

  if (hasCreated.current) return;

  hasCreated.current = true;

  createConversation();

}, []);

    const createConversation = async () => {
        try {
            setLoading(true);

            const res = await api.post(
                "/tavus/create-conversation"
            );

            console.log("Tavus Response:", res.data);

            setTavusUrl(res.data.conversationUrl);
            setConversationId(res.data.conversationId);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.error ||
                err.message ||
                "Failed to create interview"
            );
        } finally {
            setLoading(false);
        }
    };
    const endInterview = async () => {
        

  const confirmLeave =
    window.confirm(
      "Are you sure you want to end the interview?"
    );

  if (!confirmLeave) return;

  try {

    if (conversationId) {

      await api.post(
        "/tavus/end-conversation",
        {
          conversationId
        }
      );

    }

  } catch (err) {

    console.error(err);

  } finally {

    navigate("/dashboard");

  }
};
    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center text-white text-xl">
                Creating Interview Session...
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <h1 className="text-2xl font-bold text-red-500">
                    Failed to Create Interview
                </h1>

                <p className="text-slate-300">
                    {String(error)}
                </p>

                <button
                    onClick={createConversation}
                    className="px-6 py-3 bg-cyan-600 rounded-lg"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">

        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 text-white">

            <h1 className="font-bold text-xl">
                HireMe AI Interview
            </h1>

            <button
                onClick={endInterview}
                className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
                End Interview
            </button>

        </div>

        <div className="flex-1 overflow-hidden">
                {tavusUrl && (
                    <iframe
                        src={tavusUrl}
                        allow="camera; microphone; autoplay"
                        className="w-full h-full border-0 overflow-hidden"
                        title="Tavus Interview"
                    />
                )}
            </div>
        </div>
    );
};

export default InterviewCallPage;