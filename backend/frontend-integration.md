# Frontend integration snippets (React)

Use these snippets to update `ReportFound.jsx` and `ReportLost.jsx` to submit items with images to the backend.

Example submit handler (uses fetch):

```js
// assume token stored in localStorage as 'token'
async function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('location', location);
  formData.append('status', 'found'); // or 'lost'

  // files is an input element files list
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  const token = localStorage.getItem('token');

  const res = await fetch(`${process.env.REACT_APP_API_BASE || '/api'}/items`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type when sending FormData — browser will set it including boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    // handle error
  }
  const item = await res.json();
  // success handling
}
```

Notes:
- Ensure the `input` element allows multiple file selection: `<input type="file" name="images" multiple />`.
- When using `vite`/`create-react-app`, set `VITE_API_BASE` / `REACT_APP_API_BASE` to point to your backend during development (for example: `http://localhost:5000/api`).
- The backend expects JWT in the `Authorization: Bearer <token>` header.

Quick test using curl (multipart):

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -F "title=My item" -F "description=Found at park" -F "status=found" \
  -F "images=@/path/to/photo1.jpg" -F "images=@/path/to/photo2.jpg" \
  http://localhost:5000/api/items
```

Full React component example (simplified):

```jsx
import { useState } from 'react';

export default function ReportForm({ status = 'found' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null);

  const handleFiles = (e) => setFiles(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('location', location);
    fd.append('status', status);
    files.forEach(f => fd.append('images', f));

    const token = localStorage.getItem('token');

    const res = await fetch(`${process.env.VITE_API_BASE || '/api'}/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      alert('Upload failed: ' + text);
      return;
    }
    const item = await res.json();
    alert('Item created: ' + item._id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
      <input type="file" multiple accept="image/*" onChange={handleFiles} />
      <button type="submit">Submit</button>
      {progress !== null && <div>Uploading: {progress}%</div>}
    </form>
  );
}
```

Tip: For upload progress you can use Axios which exposes progress events via `onUploadProgress`.
