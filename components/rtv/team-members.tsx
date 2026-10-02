'use client';
import {useState} from 'react';
import {Plus,Mail,Pencil} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Switch} from '@/components/ui/switch';
import {api,Choice} from './forms';

type Member={email:string;name:string;role:string;active:number;rep_code:string};
const roles=[{value:'sales',label:'Sales · own pipeline & pricing'},{value:'production',label:'Production · videos & won clients'},{value:'admin',label:'Admin · full studio access'}];
export function TeamMembers({members,currentEmail,reload}:{members:Member[];currentEmail:string;reload:()=>Promise<void>}) {
  const [role,setRole]=useState('sales');
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [editing,setEditing]=useState<Member|null>(null);
  async function invite(member:Member) {
    setBusy(member.email);setError('');setNotice('');
    try {
      await api('/api/desk/members/'+encodeURIComponent(member.email)+'/invite','POST',{});
      setNotice('Setup email sent to '+member.email+'. They can follow the link to choose their own password.');
    } catch(failure:any) {setError(failure.message);} finally {setBusy('');}
  }
  async function add(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=event.currentTarget;
    setBusy('add');setError('');setNotice('');
    try {
      const response=await api('/api/desk/members','POST',{...Object.fromEntries(new FormData(form)),role});
      form.reset();setRole('sales');
      setNotice(response.invitationSent?'Team member added and setup email sent. They will choose their own password.':'Team member saved, but the setup email was not sent. '+response.warning);
      await reload();
    } catch(failure:any) {setError(failure.message);} finally {setBusy('');}
  }
  async function save(event:React.FormEvent) {
    event.preventDefault();if(!editing)return;
    setBusy('edit');setError('');setNotice('');
    try {
      await api('/api/desk/members/'+encodeURIComponent(editing.email),'PATCH',{name:editing.name,role:editing.role,active:!!editing.active});
      setNotice('Changes saved for '+editing.name+'.');setEditing(null);await reload();
    } catch(failure:any) {setError(failure.message);} finally {setBusy('');}
  }
  return <>
    <p className="form-note">Manage names, roles, and studio access here. New teammates receive an email to choose their own password. Send another setup email if they need a fresh link.</p>
    {notice&&<p className="desk-notice" role="status">{notice}</p>}
    {error&&!editing&&<p className="form-error" role="alert">{error}</p>}
    <div className="team-list">{members.map(member=><div key={member.email}>
      <div><b>{member.name}</b><span>{member.email}</span><small>{member.role} · {member.active?'Active':'Paused'} · {member.rep_code}</small></div>
      <div className="team-member-actions">
        <button type="button" className="button small" disabled={!!busy} onClick={()=>{setError('');setEditing({...member});}} aria-label={'Edit '+member.name}><Pencil size={15}/>Edit</button>
        <button type="button" className="button small" disabled={!!busy||!member.active} onClick={()=>invite(member)} aria-label={'Send setup email to '+member.name}><Mail size={15}/>{busy===member.email?'Sending…':'Send setup email'}</button>
      </div>
    </div>)}</div>
    <h3>Add a team member</h3>
    <form onSubmit={add}><div className="form-grid">
      <div className="field"><label htmlFor="member-name">Full name</label><input id="member-name" name="name" required minLength={2} maxLength={100}/></div>
      <div className="field"><label htmlFor="member-email">Sign-in email</label><input id="member-email" name="email" type="email" required maxLength={200}/></div>
      <Choice id="member-role" label="Role" value={role} onChange={setRole} options={roles}/>
    </div><button className="button light" disabled={!!busy} style={{marginTop:20}}><Plus size={17}/>{busy==='add'?'Adding…':'Add & send invitation'}</button></form>
    <Dialog open={!!editing} onOpenChange={open=>{if(!open&&!busy){setEditing(null);setError('');}}}><DialogContent className="desk-dialog">
      <DialogTitle>Edit team member</DialogTitle><DialogDescription>Update their name, role, and access. Changes apply to their next studio request.</DialogDescription>
      {editing&&<form onSubmit={save}>
        <div className="field"><label htmlFor="edit-member-name">Full name</label><input id="edit-member-name" required minLength={2} maxLength={100} value={editing.name} onChange={event=>setEditing({...editing,name:event.target.value})}/></div>
        <p className="form-note">Sign-in email: {editing.email}</p>
        {editing.email===currentEmail?<p className="form-note">Your role: Admin. Another administrator must change your own access.</p>:<>
          <Choice id="edit-member-role" label="Role" value={editing.role} onChange={value=>setEditing({...editing,role:value})} options={roles}/>
          <div className="switch-row"><div><label htmlFor="edit-member-active">Active studio access</label><p>Pausing blocks access while keeping their records and attribution.</p></div><Switch id="edit-member-active" checked={!!editing.active} onCheckedChange={active=>setEditing({...editing,active:active?1:0})}/></div>
        </>}
        {error&&<p className="form-error" role="alert">{error}</p>}
        <button className="button light" disabled={!!busy}>{busy==='edit'?'Saving…':'Save changes'}</button>
      </form>}
    </DialogContent></Dialog>
  </>;
}
