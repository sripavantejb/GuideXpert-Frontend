import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiHeadphones } from 'react-icons/fi';
import {
  addHandoffNote,
  assignHandoff,
  fetchCopilotAgents,
  fetchCopilotNotifications,
  fetchCopilotQueue,
  fetchHandoffDetail,
  resolveHandoff,
  retryHandoffReply,
  sendHandoffReply,
  suggestHandoffReply,
} from '../../../utils/humanCopilotApi';
import CopilotAgentsPanel from './CopilotAgentsPanel';
import CopilotAnalyticsPanel from './CopilotAnalyticsPanel';
import CopilotFollowupPanel from './CopilotFollowupPanel';
import CopilotLearningPanel from './CopilotLearningPanel';
import CopilotAuditPanel from './CopilotAuditPanel';
import CopilotContextPanel from './CopilotContextPanel';
import CopilotConversationView from './CopilotConversationView';
import CopilotNotesPanel from './CopilotNotesPanel';
import CopilotNotificationBanner from './CopilotNotificationBanner';
import CopilotQueuePanel from './CopilotQueuePanel';
import CopilotReplyEditor from './CopilotReplyEditor';
import { buildQueueFilterOptions, filterQueueBySr, PANEL_CLASS } from './copilotUtils';

const POLL_MS = 30000;

export default function HumanCopilotPage() {
  const [queueItems, setQueueItems] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [srFilter, setSrFilter] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [actionError, setActionError] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [lockVersion, setLockVersion] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [suggestNotice, setSuggestNotice] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [activeView, setActiveView] = useState('inbox');
  const [agents, setAgents] = useState([]);

  const queueFilterOptions = useMemo(() => buildQueueFilterOptions(agents), [agents]);

  const filteredQueue = useMemo(
    () => filterQueueBySr(queueItems, srFilter),
    [queueItems, srFilter]
  );

  const loadAgents = useCallback(async () => {
    const result = await fetchCopilotAgents();
    if (result.success) {
      setAgents(result.agents || []);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    const result = await fetchCopilotQueue({ limit: 100 });
    if (!result.success) {
      setQueueError(result.message || 'Failed to load queue');
      setQueueItems([]);
    } else {
      setQueueError('');
      setQueueItems(result.items);
    }
    setQueueLoading(false);
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    const result = await fetchCopilotNotifications();
    if (result.success) {
      setAlertCount(result.count || 0);
    }
    setAlertsLoading(false);
  }, []);

  const loadDetail = useCallback(async (handoffId) => {
    if (!handoffId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError('');
    const result = await fetchHandoffDetail(handoffId);
    if (!result.success) {
      setDetail(null);
      setDetailError(result.message || 'Failed to load handoff');
      setDetailLoading(false);
      return result;
    }
    setDetail(result.data);
    setLockVersion(result.data?.handoff?.lockVersion ?? 0);
    setDeliveryStatus(result.data?.handoff?.latestDeliveryStatus || '');
    setDetailLoading(false);
    return result;
  }, []);

  useEffect(() => {
    loadQueue();
    loadAlerts();
    loadAgents();
    const timer = setInterval(() => {
      loadQueue();
      loadAlerts();
      loadAgents();
      if (selectedId) loadDetail(selectedId);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [loadQueue, loadAlerts, loadAgents, loadDetail, selectedId]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setReplyText('');
    setSuggestedText('');
    setSuggestNotice('');
    setDeliveryStatus('');
    setActionError('');
    loadDetail(id).then((result) => {
      if (result?.data?.handoff?.failedReply?.draftText) {
        setReplyText(result.data.handoff.failedReply.draftText);
      }
    });
  };

  const handleAssign = async (target) => {
    if (!selectedId) return;
    setAssigning(true);
    setActionError('');
    const result = await assignHandoff(selectedId, target, { lockVersion });
    setAssigning(false);
    if (!result.success) {
      const assignee =
        result.assignedAgentId ||
        result.data?.assignedAgentId ||
        result.assignedSrCounsellor ||
        'another counsellor';
      const msg =
        result.message === 'already_assigned'
          ? `Already assigned to ${assignee}.`
          : result.message || 'Assign failed';
      setActionError(msg);
      if (result.lockVersion != null) setLockVersion(result.lockVersion);
      return;
    }
    setLockVersion(result.lockVersion ?? lockVersion);
    await loadQueue();
    await loadDetail(selectedId);
  };

  const handleSuggest = async () => {
    if (!selectedId) return;
    setSuggesting(true);
    setActionError('');
    setSuggestNotice('');
    const result = await suggestHandoffReply(selectedId);
    setSuggesting(false);
    if (!result.success) {
      setSuggestNotice('AI suggestions unavailable. You can reply manually.');
      return;
    }
    if (result.fallback) {
      setSuggestNotice(result.fallbackMessage || 'AI suggestions unavailable. You can reply manually.');
      return;
    }
    const first = result.suggestions?.[0]?.text;
    if (first) {
      setReplyText(first);
      setSuggestedText(first);
    }
  };

  const handleSend = async () => {
    if (!selectedId || !replyText.trim()) return;
    setSending(true);
    setActionError('');
    setDeliveryStatus('sending');
    const trimmed = replyText.trim();
    const replySource =
      !suggestedText ? 'manual' : trimmed === suggestedText.trim() ? 'ai_used' : 'ai_edited';
    const result = await sendHandoffReply(selectedId, trimmed, {
      lockVersion,
      suggestedText: suggestedText || null,
      replySource,
    });
    setSending(false);
    if (!result.success) {
      setDeliveryStatus('failed');
      if (result.lockVersion != null) setLockVersion(result.lockVersion);
      setActionError(result.message || 'Send failed');
      return;
    }
    setDeliveryStatus(result.deliveryStatus || 'sent');
    setLockVersion(result.lockVersion ?? lockVersion);
    setReplyText('');
    setSuggestedText('');
    await loadQueue();
    await loadDetail(selectedId);
  };

  const handleRetry = async () => {
    const replyId = detail?.handoff?.failedReply?.id;
    if (!selectedId || !replyId) return;
    setRetrying(true);
    setActionError('');
    setDeliveryStatus('sending');
    const result = await retryHandoffReply(selectedId, replyId, { lockVersion });
    setRetrying(false);
    if (!result.success) {
      setDeliveryStatus('failed');
      if (result.lockVersion != null) setLockVersion(result.lockVersion);
      setActionError(result.message || 'Retry failed');
      return;
    }
    setDeliveryStatus(result.deliveryStatus || 'sent');
    setLockVersion(result.lockVersion ?? lockVersion);
    await loadDetail(selectedId);
  };

  const handleResolve = async () => {
    if (!selectedId) return;
    setResolving(true);
    setActionError('');
    const result = await resolveHandoff(selectedId);
    setResolving(false);
    if (!result.success) {
      setActionError(result.message || 'Resolve failed');
      return;
    }
    setSelectedId('');
    setDetail(null);
    setReplyText('');
    await loadQueue();
    await loadAlerts();
  };

  const handleAddNote = async (text) => {
    if (!selectedId) return false;
    setAddingNote(true);
    setActionError('');
    const result = await addHandoffNote(selectedId, text);
    setAddingNote(false);
    if (!result.success) {
      setActionError(result.message || 'Failed to add note');
      return false;
    }
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            handoff: { ...prev.handoff, internalNotes: result.internalNotes },
          }
        : prev
    );
    return true;
  };

  const handoff = detail?.handoff || null;

  return (
    <div className="space-y-4">
      <header className={`${PANEL_CLASS} bg-gradient-to-br from-white via-white to-slate-50/90 px-5 py-5 sm:px-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primary-blue-600">
              <FiHeadphones className="h-4 w-4 shrink-0" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                WhatsApp Human Copilot
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 tracking-tight sm:text-[1.65rem]">
              {activeView === 'analytics'
                ? 'Conversation Analytics'
                : activeView === 'learning'
                  ? 'Learning From Counsellor Edits'
                  : activeView === 'followups'
                    ? 'Follow-up Assistant'
                    : activeView === 'agents'
                      ? 'Agents'
                      : 'SR Counsellor Inbox'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              {activeView === 'analytics'
                ? 'Operational metrics for Human Copilot volume, response times, workloads, and AI usage.'
                : activeView === 'learning'
                  ? 'See how counsellors modify AI suggestions and which topics need the most edits.'
                  : activeView === 'followups'
                    ? 'Review AI-suggested follow-ups and send only after counsellor approval.'
                    : activeView === 'agents'
                      ? 'Manage copilot agents, routing modes, workload limits, and availability.'
                      : 'Manage admin-pool handoffs, assign counsellors, reply on WhatsApp, and review lead context in one workspace.'}
            </p>
          </div>
        </div>
        <div
          className="mt-4 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"
          role="tablist"
          aria-label="Human Copilot views"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'inbox'}
            onClick={() => setActiveView('inbox')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'inbox'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inbox
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'analytics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversation Analytics
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'learning'}
            onClick={() => setActiveView('learning')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'learning'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Learning From Counsellor Edits
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'followups'}
            onClick={() => setActiveView('followups')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'followups'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Follow-up Assistant
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'agents'}
            onClick={() => setActiveView('agents')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'agents'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agents
          </button>
        </div>
      </header>

      {activeView === 'analytics' ? (
        <CopilotAnalyticsPanel />
      ) : activeView === 'learning' ? (
        <CopilotLearningPanel />
      ) : activeView === 'followups' ? (
        <CopilotFollowupPanel />
      ) : activeView === 'agents' ? (
        <CopilotAgentsPanel />
      ) : (
        <>
      <CopilotNotificationBanner count={alertCount} loading={alertsLoading} />

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </div>
      ) : null}

      {detailError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {detailError}
        </div>
      ) : null}

      <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3 min-h-[320px] lg:min-h-0">
          <CopilotQueuePanel
            items={filteredQueue}
            loading={queueLoading}
            error={queueError}
            selectedId={selectedId}
            srFilter={srFilter}
            onSrFilterChange={setSrFilter}
            filterOptions={queueFilterOptions}
            onSelect={handleSelect}
            onRetry={loadQueue}
          />
        </div>

        <div className="lg:col-span-5 flex min-h-[420px] flex-col gap-4 lg:min-h-0">
          <div className="min-h-[280px] flex-1 lg:min-h-0">
            <CopilotConversationView
              transcript={detail?.transcript}
              loading={detailLoading}
              handoff={handoff}
            />
          </div>
          <CopilotReplyEditor
            handoff={handoff}
            agents={agents}
            replyText={replyText}
            onReplyTextChange={setReplyText}
            onSuggest={handleSuggest}
            onSend={handleSend}
            onResolve={handleResolve}
            onAssign={handleAssign}
            onRetry={handleRetry}
            suggesting={suggesting}
            sending={sending}
            resolving={resolving}
            assigning={assigning}
            retrying={retrying}
            disabled={!handoff}
            deliveryStatus={deliveryStatus || handoff?.latestDeliveryStatus}
            suggestNotice={suggestNotice}
          />
        </div>

        <div className="lg:col-span-4 flex min-h-[420px] flex-col gap-4 lg:min-h-0">
          <div className="min-h-[240px] flex-1 lg:min-h-0">
            <CopilotContextPanel
              userProfile={detail?.userProfile}
              leadProfile={detail?.leadProfile}
              recentEvents={detail?.recentEvents}
              structuredSummary={detail?.structuredSummary}
              loading={detailLoading}
            />
          </div>
          <CopilotAuditPanel auditTrail={detail?.auditTrail} loading={detailLoading} />
          <CopilotNotesPanel
            notes={handoff?.internalNotes}
            onAdd={handleAddNote}
            adding={addingNote}
            disabled={!handoff}
          />
        </div>
      </div>
        </>
      )}
    </div>
  );
}
