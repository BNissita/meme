import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function CommunityPage() {
  // 1. Extracted user from AuthContext
  const { user } = useContext(AuthContext);

  // DEBUG: Check what your context is actually emitting
  console.log("Current AuthContext user:", user);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCategory, setNewCategory] = useState("Interview Experience");
  const [newContent, setNewContent] = useState("");
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  
  // Fixed categories for a cleaner, professional forum look
  const categories = ["All", "Interview Experience", "Preparation Help", "Resume Review", "Job Posting"];
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5050/api/community")
      .then((res) => res.json())
      .then((data) => {
        setDiscussions(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter & Search Logic
  const filtered = discussions.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  async function handleCreatePost() {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const response = await fetch(
        "http://localhost:5050/api/community",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            category: newCategory,
            company: newCompany || "General",
            author: user?.name || "Anonymous"
          })
        }
      );

      const newPost = await response.json();

      setDiscussions((prev) => [newPost, ...prev]);

      setNewTitle("");
      setNewCompany("");
      setNewCategory("Interview Experience");
      setNewContent("");
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleComment(postId) {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5050/api/community/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userName: user?.name || "Anonymous",
            text: commentText
          })
        }
      );

      const updatedPost = await response.json();

      setDiscussions((prev) =>
        prev.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );

      setCommentText("");
    } catch (error) {
      console.error(error);
    }
  }

  // Toggle Like Engine: Handles both Like & Unlike updates
  async function handleLike(postId) {
    if (!user || !user._id) {
      alert("You must be logged in to like a post!");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5050/api/community/${postId}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: user._id
          })
        }
      );

      const updatedPost = await response.json();

      setDiscussions((prev) =>
        prev.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Community Hub
            </h1>
            <p className="text-gray-400 mt-3">
              Share interview experiences, get resume reviews, and accelerate your preparation.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 font-medium transition shadow-lg shadow-cyan-500/20"
          >
            + New Post
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search titles, keywords, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/10"
                  : "bg-slate-900 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        <div className="space-y-5">
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-12">
              No discussions match your filter parameters. Try adjusting your keywords.
            </p>
          )}

          {filtered.map((post) => (
            <div
              key={post._id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                  <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                    {post.category}
                  </span>
                  {post.company !== "General" && (
                    <span className="bg-slate-800 text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium">
                      @{post.company}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-gray-400 text-sm block font-medium">
                    {post.author || "Anonymous"}
                  </span>

                  <span className="text-gray-600 text-xs block">
                    {new Date(post.createdAt).toLocaleDateString()} •{" "}
                    {new Date(post.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-2 text-gray-100 hover:text-cyan-400 transition cursor-pointer">
                {post.title}
              </h2>

              <p className="text-gray-400 leading-relaxed text-sm">
                {post.content}
              </p>

              {/* Action Buttons Section */}
              <div className="mt-5 flex gap-6 text-sm font-medium border-t border-slate-800/60 pt-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-1.5 transition ${
                    post.likes?.includes(user?._id)
                      ? "text-cyan-400 font-semibold"
                      : "text-gray-500 hover:text-cyan-400"
                  }`}
                >
                  👍 {(post.likes || []).length}
                </button>
                <button
                  onClick={() =>
                    setExpandedPost(
                      expandedPost === post._id ? null : post._id
                    )
                  }
                  className="flex items-center gap-1.5 text-gray-500 hover:text-cyan-400 transition"
                >
                  💬 {(post.comments || []).length} Comments
                </button>
              </div>

              {/* Collapsible Comments UI Section - Safely placed inside the post container card */}
              {expandedPost === post._id && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  {(post.comments || []).length === 0 ? (
                    <p className="text-gray-500 text-sm py-1">
                      No comments yet. Be the first one!
                    </p>
                  ) : (
                    post.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="mb-3 bg-slate-800 p-3 rounded-xl border border-slate-700/50"
                      >
                        <p className="text-cyan-400 text-sm font-medium">
                          {comment.userName}
                        </p>
                        <p className="text-gray-300 text-sm mt-0.5">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  )}

                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 text-white transition"
                    />

                    <button
                      onClick={() => handleComment(post._id)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 font-medium rounded-xl text-sm transition"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">Start a Discussion</h2>

            <input
              type="text"
              placeholder="Title (e.g., Google Frontend Interview Experience)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-cyan-500"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Company (optional)"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-gray-300 focus:outline-none focus:border-cyan-500"
              >
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Share details, questions, or roadmaps with the community..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-cyan-500 resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-gray-400 hover:border-slate-500 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 font-medium transition"
              >
                Publish Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}