'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, Crown, Shield, Mail, Check, X, LogOut, Loader2, AlertCircle } from 'lucide-react'
import { Skeleton, SkeletonRow } from '@/components/skeleton'
import { getCurrentUserProfile } from '@/app/actions/auth'
import {
  createWorkspace,
  getMyWorkspace,
  inviteMember,
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
  removeMember,
} from '@/app/actions/workspace'
import { getTierByName } from '@/lib/pricing'
import { useLocale } from '@/lib/i18n/locale-context'

interface WorkspaceMember {
  user_id: string
  role: 'owner' | 'admin' | 'member'
  email: string
}
interface Workspace {
  id: string
  name: string
  myRole: string
  members: WorkspaceMember[]
}
interface Invitation {
  id: string
  workspaceName: string
  role: string
}

export default function TeamPage() {
  const { t } = useLocale()
  const [profile, setProfile] = useState<{ id: string; tier: string } | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null | undefined>(undefined)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const [profileResult, workspaceResult, invitationsResult] = await Promise.all([
      getCurrentUserProfile(),
      getMyWorkspace(),
      getPendingInvitations(),
    ])
    if (profileResult) setProfile(profileResult)
    setWorkspace('workspace' in workspaceResult ? workspaceResult.workspace : null)
    setInvitations('invitations' in invitationsResult ? invitationsResult.invitations || [] : [])
    setLoading(false)
  }

  const isTeamPlan = profile && getTierByName(profile.tier)?.limits.teamSharing! > 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-300" />
          <h1 className="text-xl font-semibold text-white">{t('teamPage.title')}</h1>
        </div>
        <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <Skeleton className="h-5 w-32" />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-cyan-300" />
        <h1 className="text-xl font-semibold text-white">Team</h1>
      </div>

      {invitations.length > 0 && (
        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
          <h2 className="mb-3 text-sm font-semibold text-cyan-200">{t('teamPage.pendingInvites')}</h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} onHandled={load} />
            ))}
          </div>
        </section>
      )}

      {!isTeamPlan && !workspace && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <p className="text-sm text-slate-400">
            {t('teamPage.requiresTeamPlan')}{' '}
            <a href="/dashboard/billing" className="text-cyan-300 hover:text-cyan-200">{t('teamPage.upgradeToTeam')}</a>
          </p>
        </section>
      )}

      {isTeamPlan && !workspace && <CreateWorkspaceCard onCreated={load} />}

      {workspace && <WorkspaceCard workspace={workspace} currentUserId={profile?.id || ''} onChanged={load} />}
    </div>
  )
}

function InvitationRow({ invitation, onHandled }: { invitation: Invitation; onHandled: () => void }) {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)

  const handle = async (action: 'accept' | 'decline') => {
    setLoading(true)
    const result = action === 'accept' ? await acceptInvitation(invitation.id) : await declineInvitation(invitation.id)
    setLoading(false)
    if (result.success) onHandled()
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm">
      <span className="text-white">
        {t('teamPage.inviteFor', { workspace: invitation.workspaceName, role: invitation.role })}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => handle('accept')}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 transition-colors duration-150 ease-out hover:bg-emerald-500/25"
        >
          <Check className="h-3.5 w-3.5" /> {t('teamPage.accept')}
        </button>
        <button
          onClick={() => handle('decline')}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" /> {t('teamPage.decline')}
        </button>
      </div>
    </div>
  )
}

function CreateWorkspaceCard({ onCreated }: { onCreated: () => void }) {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || loading) return
    setLoading(true)
    setError(null)
    const result = await createWorkspace(name)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onCreated()
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <h2 className="mb-1 text-lg font-semibold text-white">{t('teamPage.createTitle')}</h2>
      <p className="mb-4 text-sm text-slate-400">{t('teamPage.createSubtitle')}</p>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('teamPage.namePlaceholder')}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : t('teamPage.createButton')}
        </button>
      </form>
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}

function WorkspaceCard({
  workspace,
  currentUserId,
  onChanged,
}: {
  workspace: Workspace
  currentUserId: string
  onChanged: () => void
}) {
  const { t } = useLocale()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canManage = workspace.myRole === 'owner' || workspace.myRole === 'admin'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setError(null)
    const result = await inviteMember(workspace.id, email)
    setLoading(false)
    if (result.error) setError(result.error)
    else {
      setEmail('')
      onChanged()
    }
  }

  const handleRemove = async (userId: string) => {
    if ((await removeMember(workspace.id, userId)).success) onChanged()
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <h2 className="mb-4 text-lg font-semibold text-white">{workspace.name}</h2>

      <div className="mb-6 space-y-2">
        {workspace.members.map((member) => (
          <div key={member.user_id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              {member.role === 'owner' ? (
                <Crown className="h-4 w-4 text-amber-300" />
              ) : member.role === 'admin' ? (
                <Shield className="h-4 w-4 text-cyan-300" />
              ) : (
                <Mail className="h-4 w-4 text-slate-500" />
              )}
              <span className="text-white">{member.email}</span>
              <span className="text-xs capitalize text-slate-500">{member.role}</span>
            </div>
            {(canManage || member.user_id === currentUserId) && member.role !== 'owner' && (
              <button
                onClick={() => handleRemove(member.user_id)}
                title={member.user_id === currentUserId ? t('teamPage.leaveTeam') : t('teamPage.removeMember')}
                className="text-slate-500 transition-colors duration-150 ease-out hover:text-red-300"
              >
                {member.user_id === currentUserId ? <LogOut className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
            )}
          </div>
        ))}
      </div>

      {canManage && (
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('teamPage.emailPlaceholder')}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <UserPlus className="h-4 w-4" />}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  )
}
