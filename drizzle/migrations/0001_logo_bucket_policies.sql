create policy "logo upload own folder" on storage.objects for insert to authenticated
with check (bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logo read own folder" on storage.objects for select to authenticated
using (bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logo update own folder" on storage.objects for update to authenticated
using (bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logo delete own folder" on storage.objects for delete to authenticated
using (bucket_id = 'business-logos' and (storage.foldername(name))[1] = auth.uid()::text);