import React, { useEffect, useState } from "react";
import axiosDash from "../../api/axiosDash";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  InboxArrowDownIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  KeyIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const AccessRequests = () => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("incoming"); // incoming or outgoing
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [inRes, outRes] = await Promise.all([
        axiosDash.get("/access-requests/incoming"),
        axiosDash.get("/access-requests/outgoing")
      ]);
      setIncoming(inRes.data.requests || []);
      setOutgoing(outRes.data.requests || []);
    } catch (error) {
      console.error("Error fetching access requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    const hours = window.prompt("Enter access duration in hours (e.g., 24 for 1 day):", "24");
    if (!hours || isNaN(hours)) return alert("Valid number of hours is required");
    const durationMs = Number(hours) * 60 * 60 * 1000;

    try {
      await axiosDash.put(`/access-requests/${id}/approve`, { durationMs });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error approving request");
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm("Are you sure you want to decline this request?")) return;
    try {
      await axiosDash.put(`/access-requests/${id}/decline`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error declining request");
    }
  };

  const formatStatus = (status, request) => {
    if (status === "Pending") {
      return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 w-fit">
          <ClockIcon className="w-3.5 h-3.5" /> Pending
        </span>
      );
    }
    if (status === "Declined") {
      return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20 w-fit">
          <XCircleIcon className="w-3.5 h-3.5" /> Declined
        </span>
      );
    }
    if (status === "Approved") {
      const isExpired = new Date(request.accessExpiresAt) < new Date();
      if (isExpired) {
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-admin-text-muted bg-admin-bg px-2.5 py-1 rounded-md border border-admin-border w-fit">
            <ClockIcon className="w-3.5 h-3.5" /> Expired
          </span>
        );
      }
      return (
        <span className="flex flex-col gap-1 w-fit">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 w-fit">
            <CheckCircleIcon className="w-3.5 h-3.5" /> Approved
          </span>
          <span className="text-[10px] text-admin-text-muted font-medium ml-1">
            Exp: {new Date(request.accessExpiresAt).toLocaleString()}
          </span>
        </span>
      );
    }
    return status;
  };

  return (
    <div className="w-full min-h-screen px-6 md:px-12 py-10 transition-all duration-500 animate-in fade-in">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <KeyIcon className="w-5 h-5 text-admin-primary" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-admin-primary">Security & Access</span>
        </div>
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight text-admin-text">Access Requests</h1>
        <p className="mt-2 text-[13px] md:text-[14px] font-medium text-admin-text-muted">
          Manage incoming requests for your job roles, and monitor outgoing requests you've sent.
        </p>
      </motion.div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 bg-admin-bg p-1 rounded-xl w-fit border border-admin-border">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition ${
            activeTab === "incoming"
              ? "bg-admin-surface text-admin-text shadow-sm"
              : "text-admin-text-muted hover:text-admin-text hover:bg-admin-surface/50"
          }`}
        >
          <InboxArrowDownIcon className="w-4 h-4" />
          Inbox <span className="ml-1 bg-admin-bg border border-admin-border px-2 py-0.5 rounded-md text-[10px]">{incoming.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition ${
            activeTab === "outgoing"
              ? "bg-admin-surface text-admin-text shadow-sm"
              : "text-admin-text-muted hover:text-admin-text hover:bg-admin-surface/50"
          }`}
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Sent <span className="ml-1 bg-admin-bg border border-admin-border px-2 py-0.5 rounded-md text-[10px]">{outgoing.length}</span>
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-admin-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {activeTab === "incoming" && incoming.map(req => (
              <div key={req._id} className="p-6 rounded-[24px] border bg-admin-surface border-admin-border shadow-sm flex flex-col transition-all hover:border-admin-border-hover">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-admin-primary-light text-admin-primary flex items-center justify-center font-bold text-lg">
                      {req.requesterId?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-admin-text">{req.requesterId?.name}</h3>
                      <p className="text-[11px] text-admin-text-muted">{req.requesterId?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Requested Role</p>
                  <p className="text-[14px] font-semibold text-admin-text bg-admin-bg px-3 py-2 rounded-xl border border-admin-border">{req.jobRoleId?.name}</p>
                </div>
                
                <div className="mb-5 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Message</p>
                  <p className="text-[13px] italic text-admin-text-muted bg-admin-bg/50 p-3 rounded-xl border border-admin-border/50 h-full">"{req.message || "No message provided."}"</p>
                </div>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-admin-border">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-admin-text-muted mb-2">Status</p>
                    {formatStatus(req.status, req)}
                  </div>
                  
                  {req.status === "Pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleDecline(req._id)} className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition">
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleApprove(req._id)} className="px-4 py-2 bg-emerald-500 text-white text-[12px] font-bold rounded-xl hover:bg-emerald-600 transition shadow-sm">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeTab === "incoming" && incoming.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-admin-text-muted border border-dashed border-admin-border rounded-[24px]">
                <InboxArrowDownIcon className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-semibold text-admin-text">No Inbox Requests</p>
                <p className="text-[13px]">You're all caught up! No one is requesting access right now.</p>
              </div>
            )}

            {activeTab === "outgoing" && outgoing.map(req => (
              <div key={req._id} className="p-6 rounded-[24px] border bg-admin-surface border-admin-border shadow-sm flex flex-col transition-all hover:border-admin-border-hover">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-admin-bg border border-admin-border flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-admin-text-muted" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-0.5">Role Owner</p>
                      <h3 className="font-bold text-[14px] text-admin-text">{req.ownerId?.name}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Requested Role</p>
                  <p className="text-[14px] font-semibold text-admin-text bg-admin-bg px-3 py-2 rounded-xl border border-admin-border">{req.jobRoleId?.name}</p>
                </div>
                
                <div className="mb-5 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Your Message</p>
                  <p className="text-[13px] italic text-admin-text-muted bg-admin-bg/50 p-3 rounded-xl border border-admin-border/50 h-full">"{req.message || "No message provided."}"</p>
                </div>

                <div className="mt-auto pt-4 border-t border-admin-border">
                  <p className="text-[10px] uppercase font-bold text-admin-text-muted mb-2">Status</p>
                  {formatStatus(req.status, req)}
                </div>
              </div>
            ))}

            {activeTab === "outgoing" && outgoing.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-admin-text-muted border border-dashed border-admin-border rounded-[24px]">
                <PaperAirplaneIcon className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-semibold text-admin-text">No Sent Requests</p>
                <p className="text-[13px]">You haven't requested access to any external job roles.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AccessRequests;
