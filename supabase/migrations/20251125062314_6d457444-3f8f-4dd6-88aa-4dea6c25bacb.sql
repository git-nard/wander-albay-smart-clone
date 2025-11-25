-- Create storage bucket for tourist spot images
INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-images', 'spot-images', true);

-- Allow admins to upload images
CREATE POLICY "Admins can upload spot images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'spot-images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update spot images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'spot-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete images
CREATE POLICY "Admins can delete spot images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'spot-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow public to view images
CREATE POLICY "Anyone can view spot images"
ON storage.objects FOR SELECT
USING (bucket_id = 'spot-images');