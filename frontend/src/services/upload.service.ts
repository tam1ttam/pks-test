import { api } from './api';
export async function uploadImage(file: File) { const form=new FormData(); form.append('file',file); return (await api.post<{url:string}>('/uploads/image',form)).data.url; }
