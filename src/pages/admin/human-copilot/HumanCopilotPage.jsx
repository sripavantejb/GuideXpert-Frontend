import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiHeadphones } from 'react-icons/fi';
import {
  addHandoffNote,
  assignHandoff,
  fetchCopilotAgents,
  fetchCopilotConfig,
  fetchCopilotNotifications,
  fetchCopilotQueue,
  fetchHandoffDetail,
  resolveHandoff,
  retryHandoffReply,
  sendHandoffReply,
  suggestHandoffReply,
} from '../../../utils/humanCopilotApi';
import CopilotAgentsPanel from './CopilotAgentsPanel';
import CopilotAlertStrip from './CopilotAlertStrip';
import CopilotAnalyticsPanel from './CopilotAnalyticsPanel';
import CopilotAuditPanel from './CopilotAuditPanel';
import CopilotChatPanel from './CopilotChatPanel';
import CopilotContextPanel from './CopilotContextPanel';
import CopilotFollowupPanel from './CopilotFollowupPanel';
import CopilotInboxWorkspace from './CopilotInboxWorkspace';
import CopilotLearningPanel from './CopilotLearningPanel';
import CopilotNotesPanel from './CopilotNotesPanel';
import CopilotQueuePanel from './CopilotQueuePanel';
import { buildQueueFilterOptions, filterQueueBySr, PANEL_CLASS } from './copilotUtils';
import { useCopilotTranscript } from './useCopilotTranscript';

const POLL_MS = 30000;

const VIEW_TABS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'analytics', label: 'Conversation Analytics' },
  { id: 'learning', label: 'Learning From Counsellor Edits' },
  { id: 'followups', label: 'Follow-up Assistant' },
  { id: 'agents', label: 'Agents' },
];

const VIEW_TITLES = {
  analytics: 'Conversation Analytics',
  learning: 'Learning From Counsellor Edits',
  followups: 'Follow-up Assistant',
  agents: 'Agents',
  inbox: 'SR Counsellor Inbox',
};

const VIEW_DESCRIPTIONS = {
  analytics: 'Operational metrics for Human Copilot volume, response times, workloads, and AI usage.',
  learning: 'See how counsellors modify AI suggestions and which topics need the most edits.',
  followups: 'Review AI-suggested follow-ups and send only after counsellor approval.',
  agents: 'Manage copilot agents, routing modes, workload limits, and availability.',
  inbox: 'Manage admin-pool handoffs, assign counsellors, reply on WhatsApp, and review lead context in one workspace.',
};

function CopilotViewTabs({ activeView, onChange, compact = false }) {
  return (
    <div
      className={
        compact
          ? 'inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-0.5'
          : 'mt-4 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1'
      }
      role="tablist"
      aria-label="Human Copilot views"
    >
      {VIEW_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeView === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md font-medium transition-colors ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          } ${
            activeView === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {compact && tab.id !== 'inbox' ? tab.label.split(' ')[0] : tab.label}
        </button>
      ))}
    </div>
  );
}

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
  const [copilotConfig, setCopilotConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const transcript = useCopilotTranscript(selectedId, { pollMs: POLL_MS });

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

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    const result = await fetchCopilotConfig();
    if (result.success) {
      setCopilotConfig(result.config);
    }
    setConfigLoading(false);
  }, []);

  useEffect(() => {
    loadQueue();
    loadAlerts();
    loadAgents();
    loadConfig();
    const timer = setInterval(() => {
      loadQueue();
      loadAlerts();
      loadAgents();
      if (selectedId) loadDetail(selectedId);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [loadQueue, loadAlerts, loadAgents, loadConfig, loadDetail, selectedId]);

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
      setActionError(result.message || result.errorMessage || 'Send failed');
      return;
    }
    const status = result.deliveryStatus || result.providerStatus || 'submitted';
    setDeliveryStatus(status);
    if (status === 'simulated') {
      setActionError('Reply was simulated only — not delivered to WhatsApp. Disable WA_INTEGRATION_STUB and configure Gupshup.');
    }
    setLockVersion(result.lockVersion ?? lockVersion);
    setReplyText('');
    setSuggestedText('');
    await loadQueue();
    await loadDetail(selectedId);
    await transcript.refreshLatest();
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
    await transcript.refreshLatest();
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

  if (activeView !== 'inbox') {
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
                {VIEW_TITLES[activeView]}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                {VIEW_DESCRIPTIONS[activeView]}
              </p>
            </div>
          </div>
          <CopilotViewTabs activeView={activeView} onChange={setActiveView} />
        </header>

        {activeView === 'analytics' ? (
          <CopilotAnalyticsPanel />
        ) : activeView === 'learning' ? (
          <CopilotLearningPanel />
        ) : activeView === 'followups' ? (
          <CopilotFollowupPanel />
        ) : (
          <CopilotAgentsPanel />
        )}
      </div>
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-4.25rem)] min-h-0 flex-col gap-3 p-4 lg:-m-6 lg:h-[calc(100dvh-4.75rem)] lg:p-6">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FiHeadphones className="h-4 w-4 shrink-0 text-primary-blue-600" aria-hidden />
          <h1 className="truncate text-lg font-semibold text-slate-900">SR Counsellor Inbox</h1>
        </div>
        <CopilotViewTabs activeView={activeView} onChange={setActiveView} compact />
      </div>

      <CopilotAlertStrip
        alertCount={alertCount}
        alertsLoading={alertsLoading}
        copilotConfig={copilotConfig}
        configLoading={configLoading}
        actionError={actionError}
        detailError={detailError}
      />

      <div className="min-h-0 flex-1">
      <CopilotInboxWorkspace
        queue={
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
        }
        chat={
          <CopilotChatPanel
            handoff={handoff}
            agents={agents}
            messages={transcript.messages}
            loading={detailLoading || transcript.loading}
            loadingOlder={transcript.loadingOlder}
            hasMoreOlder={transcript.hasMoreOlder}
            pendingNewCount={transcript.pendingNewCount}
            isPinnedToBottom={transcript.isPinnedToBottom}
            error={transcript.error}
            scrollRef={transcript.scrollRef}
            onScroll={transcript.updatePinned}
            onLoadOlder={transcript.loadOlder}
            onScrollToLatest={transcript.scrollToLatest}
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
        }
        context={
          <CopilotContextPanel
            userProfile={detail?.userProfile}
            leadProfile={detail?.leadProfile}
            recentEvents={detail?.recentEvents}
            structuredSummary={detail?.structuredSummary}
            loading={detailLoading}
          />
        }
        audit={<CopilotAuditPanel auditTrail={detail?.auditTrail} loading={detailLoading} />}
        notes={
          <CopilotNotesPanel
            notes={handoff?.internalNotes}
            onAdd={handleAddNote}
            adding={addingNote}
            disabled={!handoff}
          />
        }
      />
      </div>
    </div>
  );
}
