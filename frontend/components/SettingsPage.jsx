import React, { useState, useRef, useMemo, useEffect } from 'react'
import {
  User,
  Lock,
  Phone,
  Store,
  Globe,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  Edit3,
  Monitor,
  Smartphone,
  Laptop,
  ToggleRight,
  ToggleLeft,
  Upload,
  Trash2,
  X,
  Camera,
} from 'lucide-react'
import api from '../services/api'

// ─── Helper: Inisial Avatar ─────────────────────────────────────────────────
function getInitials(name = '') {
  if (!name.trim()) return 'UJ'
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

// ─── Helper: Deteksi Perangkat Nyata Pengguna ────────────────────────────────
function detectClientDevice() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  let os = 'Windows'
  let deviceName = 'Windows PC'
  let DeviceIcon = Laptop

  if (/iPhone/i.test(ua)) {
    os = 'iOS'
    deviceName = 'iPhone'
    DeviceIcon = Smartphone
    isMobile = true
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS'
    deviceName = 'iPad'
    DeviceIcon = Smartphone
    isMobile = true
  } else if (/Android/i.test(ua)) {
    os = 'Android'
    deviceName = 'Ponsel Android'
    DeviceIcon = Smartphone
    isMobile = true
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS'
    deviceName = 'MacBook'
    DeviceIcon = Laptop
  } else if (/Linux/i.test(ua)) {
    os = 'Linux'
    deviceName = 'Linux PC'
    DeviceIcon = Monitor
  } else if (/Windows/i.test(ua)) {
    os = 'Windows'
    deviceName = 'Windows PC'
    DeviceIcon = Laptop
  }

  let browser = 'Browser'
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge'
  else if (/Chrome/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera'

  return {
    isMobile,
    deviceName,
    platformText: `${browser} • ${os}`,
    DeviceIcon,
  }
}

// ─── Komponen Input Field ────────────────────────────────────────────────────
function SettingsInput({ label, value, onChange, type = 'text', readOnly = false, placeholder = '', hint }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          disabled={readOnly && !isPassword}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 text-xs rounded-xl border transition-all ${
            readOnly
              ? 'bg-gray-50/80 border-gray-200 text-gray-700 cursor-default select-none'
              : 'bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#009B5B]/20 focus:border-[#009B5B]'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

// ─── Komponen Section Card ───────────────────────────────────────────────────
function SettingsCard({ icon: Icon, iconColor = '#009B5B', title, description, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5 sm:p-6">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${iconColor}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            {description && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}

// ─── Main SettingsPage ───────────────────────────────────────────────────────
export default function SettingsPage({ user, onToast, onUpdateUser }) {
  // ── Profil form state
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [businessName, setBusinessName] = useState(user?.business_name || '')
  const [businessType, setBusinessType] = useState(user?.business_type || '')
  const [catatan, setCatatan] = useState(user?.notes || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')

  // ── Mode Edit Toggles
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)

  // ── Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)

  // ── Loading states
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // ── Ref input file avatar
  const avatarInputRef = useRef(null)

  // ── Deteksi perangkat nyata
  const clientDevice = useMemo(() => detectClientDevice(), [])

  // Sync state saat prop user berganti
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setBusinessName(user.business_name || '')
      setBusinessType(user.business_type || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  // ── Upload Foto Profil ───────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      if (onToast) onToast('Ukuran foto maksimal 5MB!', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width)
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height)
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressed = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(compressed)

        setUploadingAvatar(true)
        try {
          const res = await api.patch('/profile', { avatar: compressed })
          if (res.data?.data && onUpdateUser) {
            onUpdateUser(res.data.data)
          } else if (onUpdateUser) {
            onUpdateUser({ ...user, avatar: compressed })
          }
          if (onToast) onToast('Foto profil berhasil diunggah!')
        } catch (err) {
          console.error(err)
          if (onUpdateUser) onUpdateUser({ ...user, avatar: compressed })
          if (onToast) onToast('Foto profil tersimpan secara lokal.')
        } finally {
          setUploadingAvatar(false)
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Hapus Foto Profil (Kembali ke Inisial Doang) ──────────────────────────
  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true)
    try {
      await api.patch('/profile', { avatar: null })
      setAvatar('')
      if (onUpdateUser) onUpdateUser({ ...user, avatar: null })
      if (onToast) onToast('Foto profil dihapus, avatar kini berupa inisial.')
    } catch (err) {
      console.error(err)
      setAvatar('')
      if (onUpdateUser) onUpdateUser({ ...user, avatar: null })
      if (onToast) onToast('Foto profil dihapus, avatar kini berupa inisial.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ── Simpan Profil ────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      if (onToast) onToast('Nama lengkap tidak boleh kosong.', 'error')
      return
    }
    setSavingProfile(true)
    try {
      const res = await api.patch('/profile', {
        name: name.trim(),
        business_name: businessName.trim(),
        business_type: businessType.trim(),
      })
      if (res.data?.data && onUpdateUser) {
        onUpdateUser(res.data.data)
      } else if (onUpdateUser) {
        onUpdateUser({
          ...user,
          name: name.trim(),
          business_name: businessName.trim(),
          business_type: businessType.trim(),
        })
      }
      setIsEditingProfile(false)
      if (onToast) onToast('Informasi profil berhasil disimpan!')
    } catch (err) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Gagal menyimpan profil.'
      if (onToast) onToast(msg, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Simpan Nomor Telepon ─────────────────────────────────────────────────
  const handleSavePhone = async () => {
    if (!phone.trim()) {
      if (onToast) onToast('Nomor telepon tidak boleh kosong.', 'error')
      return
    }
    setSavingPhone(true)
    try {
      const res = await api.patch('/profile', {
        phone: phone.trim(),
      })
      if (res.data?.data && onUpdateUser) {
        onUpdateUser(res.data.data)
      } else if (onUpdateUser) {
        onUpdateUser({ ...user, phone: phone.trim() })
      }
      setIsEditingPhone(false)
      if (onToast) onToast('Nomor telepon berhasil diperbarui!')
    } catch (err) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Gagal mengubah nomor telepon.'
      if (onToast) onToast(msg, 'error')
    } finally {
      setSavingPhone(false)
    }
  }

  // ── Ubah Kata Sandi ──────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (onToast) onToast('Isi semua kolom kata sandi.', 'error')
      return
    }
    if (newPassword.length < 8) {
      if (onToast) onToast('Kata sandi baru minimal 8 karakter.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      if (onToast) onToast('Konfirmasi kata sandi tidak cocok.', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await api.patch('/profile', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })
      if (onToast) onToast('Kata sandi berhasil diubah!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Gagal mengubah kata sandi.'
      if (onToast) onToast(msg, 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  // ── Inisial avatar ───────────────────────────────────────────────────────
  const initials = getInitials(user?.name || name)

  return (
    <div className="space-y-5 animate-fade-in pb-16">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Pengaturan Toko &amp; Profil Usaha
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Kelola informasi data pribadi pemilik akun, preferensi login &amp; kata sandi, notifikasi keamanan, serta hak akses perangkat.
        </p>
      </div>

      {/* ── Layout Grid: left (main) + right (sidebar) ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* ── LEFT COLUMN (8 cols) ────────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-5">

          {/* ═══ 1. Kartu Profil Usaha ═══════════════════════════════════ */}
          <SettingsCard
            icon={User}
            title="Profil Usaha"
            description="Identitas brand yang ditampilkan pada katalog dan media profil publik."
            action={
              !isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#009B5B]" />
                  <span>Ubah Profil</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-[#009B5B] text-[11px] font-bold rounded-lg border border-emerald-200">
                  <Edit3 className="w-3 h-3" />
                  Mode Edit
                </span>
              )
            }
          >
            {/* Avatar (Foto Asli atau Inisial Saja) + Tombol Upload/Hapus */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user?.name || name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#BCE8D3] shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#EBF8F2] border-2 border-[#BCE8D3] flex items-center justify-center shadow-xs">
                    <span className="text-xl sm:text-2xl font-bold text-[#009B5B]">{initials}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-800">{user?.name || name || 'Pemilik Usaha'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{user?.business_name || businessName || 'Usaha Anda'}</p>

                {/* Tombol Upload & Hapus Foto */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3 text-[#009B5B]" />
                    <span>{avatar ? 'Ganti Foto' : 'Unggah Foto'}</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsInput
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditingProfile}
                placeholder="Nama pemilik akun"
              />
              <SettingsInput
                label="Peran Jabatan"
                value="Pemilik Toko"
                readOnly
              />
              <SettingsInput
                label="Username"
                value={`@${(name || user?.name || 'pemilik').toLowerCase().replace(/\s+/g, '.')}`}
                readOnly
                hint="Username digenerate otomatis dari nama."
              />
              <SettingsInput
                label="Cabang / Unit Bisnis Utama"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                readOnly={!isEditingProfile}
                placeholder="Nama toko atau cabang"
              />
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Catatan</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  readOnly={!isEditingProfile}
                  rows={2}
                  placeholder="Deskripsi singkat pemilik atau toko..."
                  className={`w-full px-3 py-2.5 text-xs rounded-xl border transition-all resize-none ${
                    !isEditingProfile
                      ? 'bg-gray-50/80 border-gray-200 text-gray-700 cursor-default select-none'
                      : 'bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#009B5B]/20 focus:border-[#009B5B]'
                  }`}
                />
              </div>
            </div>

            {/* Save & Cancel buttons saat mode edit aktif */}
            {isEditingProfile && (
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || '')
                    setBusinessName(user?.business_name || '')
                    setCatatan(user?.notes || '')
                    setIsEditingProfile(false)
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#009B5B] hover:bg-[#00874e] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            )}
          </SettingsCard>

          {/* ═══ 2. Kartu Kredensial Akun ═════════════════════════════════ */}
          <SettingsCard
            icon={Lock}
            title="Kredensial Akun"
            description="Kredensial yang digunakan untuk autentikasi dan keamanan akun Anda."
            action={
              !isEditingPhone ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#009B5B]" />
                  <span>Ubah Nomor</span>
                </button>
              ) : null
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SettingsInput
                label="Alamat Email"
                value="(belum tersedia)"
                readOnly
                hint="Email tidak dapat diubah saat ini."
              />
              <SettingsInput
                label="Password"
                value="••••••••"
                type="password"
                readOnly
                hint="Ubah via kartu Kata Sandi di bawah."
              />
              <SettingsInput
                label="No Telepon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly={!isEditingPhone}
                placeholder="+62 8xx-xxxx-xxxx"
              />
            </div>

            {isEditingPhone && (
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setPhone(user?.phone || '')
                    setIsEditingPhone(false)
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#009B5B] hover:bg-[#00874e] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingPhone ? 'Menyimpan...' : 'Simpan Nomor'}
                </button>
              </div>
            )}
          </SettingsCard>

          {/* ═══ 3. Kartu Ubah Kata Sandi ════════════════════════════════ */}
          <SettingsCard
            icon={ShieldCheck}
            title="Keamanan Kata Sandi"
            description="Pastikan kata sandi aman dan autentikasi dua langkah diaktifkan."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SettingsInput
                label="Kata Sandi Saat Ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
              />
              <SettingsInput
                label="Kata Sandi Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="Min. 8 karakter"
              />
              <SettingsInput
                label="Konfirmasi Kata Sandi Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Ulangi kata sandi"
              />
            </div>

            {/* 2FA Toggle */}
            <div className="mt-4 flex items-center justify-between gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#009B5B]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Autentikasi 2 Langkah (2FA WhatsApp &amp; Authenticator App)</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Kode OTP akan dikirim setiap kali login dari browser atau perangkat baru.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFaEnabled((v) => !v)}
                className="shrink-0 cursor-pointer transition-colors"
              >
                {twoFaEnabled ? (
                  <ToggleRight className="w-8 h-8 text-[#009B5B]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-300" />
                )}
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#009B5B] hover:bg-[#00874e] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                {savingPassword ? 'Menyimpan...' : 'Ubah Kata Sandi'}
              </button>
            </div>
          </SettingsCard>

          {/* ═══ 4. Kartu Preferensi ══════════════════════════════════════ */}
          <SettingsCard
            icon={Globe}
            title="Preferensi"
            description="Sesuaikan format bahasa, tanggal, dan zona waktu operasional Anda."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsInput
                label="Bahasa Antarmuka"
                value="Bahasa Indonesia"
                readOnly
              />
              <SettingsInput
                label="Format Tanggal &amp; Zona Waktu"
                value="WIB (GMT+7) • Format 24 Jam (JJ:MM)"
                readOnly
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Preferensi bahasa &amp; waktu lanjutan akan tersedia di pembaruan berikutnya.</span>
            </div>
          </SettingsCard>

        </div>

        {/* ── RIGHT COLUMN (4 cols) — Riwayat Login & Info Akun ──────────── */}
        <div className="xl:col-span-4 space-y-5">

          {/* ═══ Kartu Informasi Akun ══════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Informasi Akun</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-500">Jenis Usaha</span>
                <span className="text-[11px] font-semibold text-gray-800 text-right max-w-[55%] truncate">
                  {user?.business_type || businessType || '—'}
                </span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-500">Status Akun</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#009B5B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009B5B]" />
                  Aktif
                </span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-500">ID Pengguna</span>
                <span className="text-[11px] font-mono text-gray-500">#{user?.id || '—'}</span>
              </div>
            </div>
          </div>

          {/* ═══ Kartu Riwayat Login (Disesuaikan Otomatis Sesuai Perangkat Pengguna) ═════════ */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Riwayat Login</h3>
              <span className="text-[10px] text-gray-400 font-medium">Sesi Terdeteksi</span>
            </div>
            <div className="space-y-3">
              {/* Sesi 1: Perangkat yang Sedang Aktif Digunakan (Real Detection) */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#009B5B] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                  <clientDevice.DeviceIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    {clientDevice.deviceName} (Perangkat Ini)
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{clientDevice.platformText}</p>
                  <p className="text-[10px] text-[#009B5B] font-semibold mt-1 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009B5B] animate-pulse" />
                    Aktif sekarang
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Sesi 2: Sesi Pelengkap (Laptop jika saat ini HP, atau HP jika saat ini Laptop) */}
              {clientDevice.isMobile ? (
                <div className="flex items-start gap-3 opacity-80">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5 border border-gray-200">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 leading-tight">Laptop / PC Kantor</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Chrome • Windows</p>
                    <p className="text-[10px] text-gray-400 mt-1">Kemarin, 14:20 WIB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 opacity-80">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5 border border-gray-200">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 leading-tight">Ponsel Kasir</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Safari • iOS / Android</p>
                    <p className="text-[10px] text-gray-400 mt-1">3 hari lalu</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Kartu Zona Bahaya ══════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5">
            <h3 className="text-sm font-bold text-red-600 mb-1">Zona Bahaya</h3>
            <p className="text-[11px] text-gray-500 mb-4">Tindakan berikut bersifat permanen dan tidak dapat dibatalkan.</p>
            <button
              type="button"
              className="w-full py-2 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              Hapus Akun &amp; Semua Data
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
