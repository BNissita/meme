import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { api } from "../context/AuthContext";

const InterviewCallPage = () => {
    const [tavusUrl, setTavusUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const downloadPDF = async () => {

        const reportElement =
            document.getElementById(
                "report-content"
            );

        const canvas =
            await html2canvas(reportElement, {
                scale: 2
            });

        const imgData =
            canvas.toDataURL("image/png");

        const pdf =
            new jsPDF("p", "mm", "a4");

        const width =
            pdf.internal.pageSize.getWidth();

        const height =
            (canvas.height * width) /
            canvas.width;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            width,
            height
        );

        pdf.save(
            "HireMe-AI-Report.pdf"
        );
    };
    const [conversationId, setConversationId] = useState(null);
    const [generating, setGenerating] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        createConversation();
    }, []);

    const createConversation = async () => {
        try {
            setLoading(true);

            const res = await api.post(
                "/tavus/create-conversation"
            );

            setTavusUrl(res.data.conversationUrl);
            setConversationId(res.data.conversationId);
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.message ||
                "Failed to create interview";

            if (errorMessage === "Resume required") {
                navigate("/resume-upload");
                return;
            }

            if (errorMessage === "Job Description required") {
                navigate("/jd-upload");
                return;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    const endInterview = async () => {

        setGenerating(true);

        setTimeout(async () => {

            try {

                const res = await api.post(
                    `/tavus/finalize/${conversationId}`
                );

                navigate(
                    `/reports/${res.data.reportId}`
                );

            } catch (err) {

                console.error(err);

                alert(
                    "Failed to generate report"
                );

                setGenerating(false);
            }

        }, 30000);
    };

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center text-white text-xl">
                Creating Interview Session...
            </div>
        );
    }

    if (generating) {

        return (

            <div className="h-screen bg-black flex flex-col items-center justify-center text-white">

                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-cyan-500"></div>

                <h2 className="mt-6 text-2xl font-bold">
                    Generating Interview Report
                </h2>

                <p className="text-slate-400 mt-2">
                    Processing transcript and analysis...
                </p>

                <p className="text-slate-500 mt-4 text-sm">
                    This may take up to 30 seconds
                </p>

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
        <div className="h-screen overflow-hidden bg-black flex flex-col">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 text-white">

                <h1 className="font-bold text-xl">
                    HireMe AI Interview
                </h1>

                <button
                    onClick={endInterview}
                    className="px-4 py-2 bg-red-600 rounded-lg"
                >
                    End Interview
                </button>

            </div>

            <div className="flex-1 overflow-hidden">
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