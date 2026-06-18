import React, { useEffect, useState } from "react";
import { api } from "../context/AuthContext";

const InterviewCallPage = () => {
    const [tavusUrl, setTavusUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
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
        <div className="h-screen bg-black flex flex-col">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 text-white">
                <h1 className="font-bold text-xl">
                    HireMe AI Interview
                </h1>
            </div>

            <div className="flex-1">
                {tavusUrl && (
                    <iframe
                        src={tavusUrl}
                        allow="camera; microphone; autoplay"
                        className="w-full h-full border-0"
                        title="Tavus Interview"
                    />
                )}
            </div>
        </div>
    );
};

export default InterviewCallPage;