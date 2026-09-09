# Software Requirements Specification — JARA

JARA adalah aplikasi web untuk mengelola tugas pribadi maupun tim. Pengguna dapat membuat beberapa daftar tugas yang berfungsi sebagai list atau project, menentukan prioritas dan tenggat waktu, menandai tugas selesai, serta melihat progres. Pemilik daftar dapat menambahkan pengguna lain agar pekerjaan dapat dilakukan bersama. Administrator bertanggung jawab menambah, mengubah, dan menonaktifkan akun tanpa menghapus riwayat kolaborasi.

## User Story

### Pengguna

Sebagai pengguna, saya ingin mengelola daftar dan tugas dalam satu workspace agar pekerjaan pribadi maupun tim dapat direncanakan dan dipantau dengan jelas.

### Pemilik Daftar

Sebagai pemilik daftar, saya ingin mengatur anggota dan memantau progres agar kolaborasi tetap terkontrol dan seluruh pekerjaan dapat diselesaikan tepat waktu.

### Administrator

Sebagai administrator, saya ingin mengelola serta menonaktifkan akun pengguna agar akses ke aplikasi tetap aman tanpa menghilangkan riwayat data.

## Daftar SRS

| Kode | Deskripsi | Acceptance Criteria |
| --- | --- | --- |
| **SRS-001** | Menyediakan fondasi aplikasi Laravel + React dalam satu repository. | - Laravel dapat dijalankan tanpa error.<br>- React dan TypeScript dibangun melalui Vite.<br>- Route SPA dapat dibuka langsung dari browser.<br>- Backend dan frontend menggunakan satu repository. |
| **SRS-002** | Pengguna dapat login menggunakan email dan password. | - Form menyediakan field email dan password.<br>- Email wajib berformat valid.<br>- Kredensial valid membuat session baru.<br>- Kredensial salah menghasilkan respons `422` tanpa membocorkan data sensitif.<br>- Login dibatasi dengan rate limit. |
| **SRS-003** | Aplikasi mempertahankan dan menampilkan sesi pengguna aktif. | - Frontend mengambil CSRF cookie sebelum login.<br>- Session disimpan melalui cookie HTTP-only.<br>- `GET /api/me` mengembalikan identitas, role, dan status pengguna.<br>- Refresh halaman tidak mengharuskan login ulang selama session masih berlaku.<br>- Token autentikasi tidak disimpan di local storage. |
| **SRS-004** | Pengguna dapat logout dari aplikasi. | - Logout tersedia bagi pengguna terautentikasi.<br>- Session lama dibatalkan.<br>- CSRF token diperbarui.<br>- Pengguna kembali ke halaman login dan tidak dapat membuka route terproteksi. |
| **SRS-005** | Akun berstatus `DISABLED` tidak dapat menggunakan aplikasi. | - Status akun hanya `ACTIVE` atau `DISABLED`.<br>- Akun `DISABLED` tidak dapat memulai session.<br>- Session akun yang telah dinonaktifkan ditolak pada endpoint terproteksi.<br>- Penonaktifan tidak menghapus riwayat relasi pengguna. |
| **SRS-006** | Pengguna dapat melihat daftar tugas yang boleh diakses. | - Daftar yang dimiliki pengguna ditampilkan.<br>- Daftar yang diikuti sebagai anggota ditampilkan.<br>- Daftar milik pengguna lain yang tidak diikuti tidak ditampilkan.<br>- Kondisi loading, kosong, dan error tersedia. |
| **SRS-007** | Pengguna dapat membuat daftar tugas baru. | - Nama daftar wajib diisi.<br>- Deskripsi bersifat opsional.<br>- Pembuat otomatis menjadi pemilik daftar.<br>- Pemilik tidak diduplikasi sebagai baris anggota.<br>- Daftar baru muncul pada workspace pengguna. |
| **SRS-008** | Pemilik dapat melihat dan mengubah detail daftar tugas. | - Pemilik dapat mengubah nama dan deskripsi.<br>- Anggota dapat melihat detail tetapi tidak dapat mengubah metadata.<br>- Pengguna yang tidak terkait tidak dapat melihat daftar.<br>- Validasi dan kegagalan otorisasi mengikuti format API standar. |
| **SRS-009** | Pemilik dapat menghapus daftar tugas. | - Hanya pemilik yang dapat menghapus daftar.<br>- Konfirmasi ditampilkan sebelum penghapusan.<br>- Penghapusan daftar turut menghapus membership dan tugas terkait.<br>- Anggota dan pengguna luar menerima penolakan otorisasi. |
| **SRS-010** | Pemilik dapat melihat, menambah, dan menghapus anggota daftar. | - Hanya pemilik yang dapat mengubah membership.<br>- Pengguna yang sama tidak dapat ditambahkan dua kali.<br>- Pemilik tidak dapat ditambahkan sebagai anggota biasa.<br>- `joined_at` tersimpan saat anggota ditambahkan.<br>- Anggota yang dihapus kehilangan akses ke daftar. |
| **SRS-011** | Pengguna yang berpartisipasi dapat melihat tugas dalam suatu daftar. | - Pemilik dan anggota dapat melihat tugas pada daftar tersebut.<br>- Pengguna yang tidak terkait tidak dapat melihat tugas.<br>- Tugas menampilkan judul, prioritas, status, assignee, tanggal mulai, dan tenggat bila tersedia.<br>- Kondisi daftar tugas kosong ditampilkan dengan jelas. |
| **SRS-012** | Pengguna yang berpartisipasi dapat membuat tugas. | - Judul tugas wajib diisi.<br>- Deskripsi, assignee, tanggal mulai, dan tenggat bersifat opsional.<br>- Prioritas hanya `LOW`, `MEDIUM`, atau `HIGH` dan default-nya `MEDIUM`.<br>- Status awal default adalah `TODO`.<br>- Tugas selalu terhubung dengan satu daftar.<br>- Respons berhasil mengikuti envelope API standar. |
| **SRS-013** | Pengguna yang berpartisipasi dapat mengubah dan menghapus tugas. | - Pengguna dapat mengubah field tugas yang diizinkan.<br>- Pengguna dapat menghapus tugas dari daftar yang dapat diakses.<br>- Pengguna luar menerima penolakan akses.<br>- Perubahan yang tidak valid tidak disimpan. |
| **SRS-014** | Status dan waktu penyelesaian tugas dikelola secara konsisten. | - Status hanya `TODO`, `IN_PROGRESS`, atau `COMPLETED`.<br>- Perubahan ke `COMPLETED` mengisi `completed_at`.<br>- Membuka kembali tugas mengosongkan `completed_at`.<br>- Status terbaru terlihat pada detail daftar. |
| **SRS-015** | Tugas dapat memiliki tanggal mulai dan tenggat. | - Kedua tanggal bersifat opsional.<br>- Tanggal menggunakan format yang konsisten pada API dan UI.<br>- Tenggat sebelum tanggal mulai ditolak.<br>- Tugas yang melewati tenggat dapat dibedakan pada UI. |
| **SRS-016** | Pengguna dapat menentukan prioritas tugas. | - Prioritas hanya `LOW`, `MEDIUM`, atau `HIGH`.<br>- Tugas baru memiliki prioritas default `MEDIUM`.<br>- Prioritas dapat diubah oleh peserta daftar.<br>- Prioritas terlihat pada daftar dan detail tugas.<br>- Tugas dapat difilter atau diurutkan berdasarkan prioritas. |
| **SRS-017** | Tugas dapat diberikan kepada peserta daftar. | - Tugas boleh tidak memiliki assignee.<br>- Assignee hanya boleh pemilik atau anggota aktif pada daftar yang sama.<br>- Pengguna di luar daftar tidak dapat dipilih atau dikirim melalui API.<br>- Saat anggota dihapus, assignment miliknya pada daftar tersebut menjadi kosong. |
| **SRS-018** | Aplikasi menampilkan progres daftar tugas. | - Progres dihitung dari jumlah tugas `COMPLETED` dibanding total tugas.<br>- Perubahan status memperbarui progres.<br>- Daftar tanpa tugas tidak menghasilkan pembagian dengan nol.<br>- Nilai progres konsisten antara API dan UI. |
| **SRS-019** | Administrator dapat melihat daftar pengguna. | - Endpoint dan halaman hanya dapat diakses role `ADMIN`.<br>- Daftar menampilkan identitas, role, dan status akun.<br>- Pengguna biasa menerima respons `403`.<br>- Kondisi loading, kosong, dan error tersedia. |
| **SRS-020** | Administrator dapat membuat pengguna. | - Nama, username, email, password, role, dan status divalidasi.<br>- Username dan email harus unik.<br>- Password disimpan dalam bentuk hash.<br>- Role hanya `USER` atau `ADMIN`.<br>- Tidak tersedia registrasi publik. |
| **SRS-021** | Administrator dapat mengubah dan menonaktifkan pengguna. | - Administrator dapat mengubah data pengguna yang diizinkan.<br>- Status dapat diubah menjadi `ACTIVE` atau `DISABLED`.<br>- Penonaktifan menghentikan akses pengguna.<br>- Pengguna tidak dihapus permanen melalui alur normal.<br>- Relasi historis tetap utuh. |
| **SRS-022** | Seluruh API menggunakan format respons yang konsisten. | - Respons sukses memiliki `success: true` dan data bila tersedia.<br>- Respons gagal memiliki `success: false` dan message.<br>- Error validasi memiliki kumpulan error per field.<br>- Status `401`, `403`, `404`, dan `422` digunakan secara konsisten.<br>- Stack trace dan informasi sensitif tidak dikirim ke client. |
| **SRS-023** | Aplikasi menyediakan kontrol akses sesuai peran dan relasi data. | - Endpoint terproteksi memerlukan autentikasi.<br>- Policy memeriksa kepemilikan atau membership.<br>- Middleware melindungi area administrator.<br>- Query collection tidak membocorkan record yang tidak boleh diakses.<br>- Administrator tidak otomatis dapat membaca daftar privat bila bukan peserta. |
| **SRS-024** | Antarmuka dapat digunakan pada perangkat modern dan kondisi umum. | - Layout tetap dapat digunakan pada desktop dan perangkat kecil.<br>- Form memiliki label yang dapat diakses keyboard/screen reader.<br>- Fokus, loading, empty, dan error state terlihat jelas.<br>- Preferensi reduced motion dihormati.<br>- Tidak ada error console pada alur utama. |
| **SRS-025** | Project menyediakan standar pengembangan dan pengujian tim. | - Instalasi, migrasi, seeding, dan start server terdokumentasi.<br>- Test backend dan frontend dapat dijalankan secara lokal.<br>- TypeScript, ESLint, Prettier, dan Pint tersedia.<br>- Konvensi branch, commit, PR, dan Definition of Done terdokumentasi.<br>- `.env`, dependency, dan secret tidak masuk Git. |

## Batasan MVP

MVP tidak mencakup registrasi publik, lupa password, notifikasi, komentar tugas, lampiran file, recurring task, real-time update, kalender eksternal, maupun penghapusan permanen akun pengguna. Istilah “hapus akun” pada ruang lingkup JARA berarti menonaktifkan akun (`DISABLED`) agar riwayat tugas dan kolaborasi tetap tersimpan. Penambahan fitur di luar daftar SRS harus dibahas sebagai perubahan scope.

## Catatan Implementasi Saat Ini

Fondasi, autentikasi, skema database, policy, route frontend, seed data, dan quality tooling sudah tersedia. Endpoint list, membership, dan UI kolaborasinya sudah diimplementasikan; task, progress, dan admin-user masih berstatus planned; status endpoint aktual dicatat di [API.md](API.md).
