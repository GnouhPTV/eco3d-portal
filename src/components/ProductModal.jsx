import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import { formatMoney, formatNumber } from '../utils/format.js'

const tabs = [
  { id: 'info', label: 'Thông tin' },
  { id: 'specs', label: 'Thông số' },
  { id: 'alternateCodes', label: 'Mã khác' },
  { id: 'units', label: 'ĐVT' },
  { id: 'notes', label: 'Ghi chú' },
  { id: 'stock', label: 'Tồn kho' },
  { id: 'supplier', label: 'Nhà cung cấp' },
  { id: 'vouchers', label: 'Chứng từ' },
  { id: 'priceList', label: 'Bảng giá' },
  { id: 'inventoryCheck', label: 'Kiểm kho' },
  { id: 'history', label: 'Nhật ký' },
  { id: 'links', label: 'Video & URL' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'documents', label: 'Tài liệu' },
]

const fieldLabels = {
  Ma: 'Mã hàng',
  Ma1: 'Mã tay',
  Ten: 'Tên hàng',
  TenHang: 'Tên hàng',
  TenThanhPham: 'Tên thành phẩm',
  NhomHang: 'Nhóm hàng',
  TenNhomHang: 'Tên nhóm hàng',
  NhomHang1: 'Nhóm hàng 1',
  NhomHang2: 'Nhóm hàng 2',
  HangSX: 'Hãng sản xuất',
  TenHangSX: 'Tên hãng sản xuất',
  QuiCach: 'Quy cách',
  QuiCach_Thung: 'Quy cách thùng',
  DVT: 'Đơn vị tính',
  DVT1: 'Đơn vị quy đổi',
  NuocSX: 'Nước sản xuất',
  TenNuocSX: 'Tên nước sản xuất',
  LoaiHang: 'Loại hàng',
  TenLoaiHang: 'Tên loại hàng',
  TinhTrang: 'Tình trạng',
  MoTa: 'Mô tả',
  MoTa_EN: 'Mô tả tiếng Anh',
  Giasi: 'Giá bán buôn',
  GiaSi: 'Giá bán buôn',
  GiaLe: 'Giá bán lẻ',
  GiaNhap: 'Giá nhập',
  GiaNiemYet: 'Giá niêm yết',
  GiaNet: 'Giá net',
  DonGia: 'Đơn giá',
  ThanhTien: 'Thành tiền',
  Cap1: 'Giá đại lý cấp 1',
  Cap2: 'Cấp 2',
  Cap3: 'Cấp 3',
  Cap4: 'Cấp 4',
  KhuyenMaiNhap: 'Khuyến mại giá nhập',
  KhuyenMaiBanLe: 'Khuyến mại bán lẻ',
  KhuyenMaiBanBuon: 'Khuyến mại bán buôn',
  KM_GiaSi: 'Khuyến mại giá sỉ',
  KM_END: 'Kết thúc khuyến mại',
  MucThue: 'Mức thuế',
  VAT: 'VAT',
  TonToiDa: 'Tồn tối đa',
  TonToiThieu: 'Tồn tối thiểu',
  SL_Ton: 'Tồn kho',
  SL_Ban: 'Đã bán',
  SL_Giao: 'Đã giao',
  So_Luong: 'Số lượng',
  ConLai: 'Còn lại',
  Kho: 'Kho',
  MaKho: 'Mã kho',
  TenKho: 'Tên kho',
  TenThuKho: 'Thủ kho',
  ViTri: 'Vị trí',
  KiemKho: 'Kiểm kho',
  ChuyenNoiBo: 'Chuyển nội bộ',
  MaLienKet: 'Mã liên kết',
  MaCu: 'Mã cũ',
  NhaCC: 'Nhà cung cấp',
  TenNhaCC: 'Tên nhà cung cấp',
  MaNhaCungCap: 'Mã nhà cung cấp',
  TenNhaCungCap: 'Tên nhà cung cấp',
  KhachHang: 'Khách hàng',
  NhanVien: 'Nhân viên',
  TenNhanVien: 'Tên nhân viên',
  GhiChu: 'Ghi chú',
  Keyword: 'Từ khóa',
  URLLink: 'Link website',
  ECO3D_URLLink: 'Link website ECO3D',
  URL: 'URL',
  UrlLink: 'URL tài liệu',
  ImageUrl: 'Ảnh',
  FileName: 'Tên file',
  FileType: 'Loại file',
  FileSize: 'Dung lượng',
  CopyLink: 'Link copy',
  Name: 'Tên tài liệu',
  Status: 'Trạng thái',
  Ngay: 'Ngày',
  Date: 'Ngày',
  Date1: 'Ngày tạo',
  Date2: 'Ngày cập nhật',
  NgayTao: 'Ngày tạo',
  NgayKiemKho: 'Ngày kiểm kho',
  NgayPS: 'Ngày phát sinh',
  NgayChuyen: 'Ngày chuyển',
  NgayThayDoi: 'Ngày thay đổi',
  User1: 'Người tạo',
  User2: 'Người sửa',
  UploadWeb: 'Upload web',
  VatTu: 'Vật tư',
  XNT: 'Xuất nhập tồn',
  QuanLyLo: 'Quản lý lô',
  LaDichVu: 'Là dịch vụ',
  KhongTinhThue: 'Không tính thuế',
  DongBoGia: 'Đồng bộ giá',
  InBaoGia: 'In báo giá',
  MauSac: 'Màu sắc',
  KichThuoc: 'Kích thước',
  KichCo: 'Kích cỡ',
  TrongLuong: 'Trọng lượng',
  CongSuat: 'Công suất',
  QuangThong: 'Quang thông',
  HanSuDung: 'Hạn sử dụng',
  SoLuongMotNgay: 'Số lượng một ngày',
  SLg1Lo: 'Số lượng 1 lô',
  PhuongAnGia: 'Phương án giá',
  TenTiengAnh: 'Tên tiếng Anh',
  TenTiengNhat: 'Tên tiếng Nhật',
  Chung_tu: 'Chứng từ',
  LoaiCT: 'Loại chứng từ',
}

const moneyColumns = new Set([
  'Giasi', 'GiaSi', 'GiaLe', 'GiaNhap', 'GiaNiemYet', 'GiaNet', 'DonGia',
  'ThanhTien', 'Cap1', 'Cap2', 'Cap3', 'Cap4', 'HoaHong', 'MucThuong',
])

const dateColumns = new Set([
  'Ngay', 'Date', 'Date1', 'Date2', 'NgayTao', 'NgayKiemKho', 'NgayPS',
  'NgayChuyen', 'NgayThayDoi', 'KM_END',
])

const lookupColumns = {
  NhomHang: ['TenNhomHang'],
  NhomHang1: ['TenNhomHang1'],
  NhomHang2: ['TenNhomHang2'],
  HangSX: ['TenHangSX'],
  NuocSX: ['TenNuocSX'],
  LoaiHang: ['TenLoaiHang'],
  NhanVien: ['TenNhanVien'],
  Kho: ['TenKho'],
  NhaCC: ['TenNhaCCLookup', 'TenNhaCC'],
  User1: ['TenUser1'],
  User2: ['TenUser2'],
  MaNhaCungCap: ['TenNhaCungCap'],
}

const companionLookupColumns = new Set([
  'TenNhomHang',
  'TenNhomHang1',
  'TenNhomHang2',
  'TenHangSX',
  'TenNuocSX',
  'TenLoaiHang',
  'TenNhanVien',
  'TenKho',
  'TenNhaCCLookup',
  'TenUser1',
  'TenUser2',
  'TenNhaCungCap',
])

export default function ProductModal({ product, onClose }) {
  const [profile, setProfile] = useState(null)
  const [detailProduct, setDetailProduct] = useState(product)
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)

  const displayProduct = detailProduct || product
  const mainInfo = profile?.mainInfo || displayProduct?.extraInfo || {}
  const extraInfo = displayProduct?.extraInfo || {}

  useEffect(() => {
    let cancelled = false
    setProfile(null)
    setDetailProduct(product)
    setActiveTab('info')
    setLoading(true)

    if (!product?.ma) {
      setLoading(false)
      return undefined
    }

    api.get(`/products/${encodeURIComponent(product.ma)}/profile`)
      .then((res) => {
        const data = res.data?.data
        if (cancelled) return
        setProfile(data || null)
        setDetailProduct(data?.product || product)
      })
      .catch(() => {
        if (!cancelled) setDetailProduct(product)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [product])

  useEffect(() => {
    let cancelled = false
    const sourceUrl = firstValidLink(mainInfo.WebsiteLink, extraInfo.WebsiteLink, displayProduct?.urlLink, mainInfo.URLLink)

    setImageUrl('')
    setImageError(false)

    if (!sourceUrl) return undefined

    if (isImageUrl(sourceUrl)) {
      setImageUrl(sourceUrl)
      return undefined
    }

    api.get('/products/image-preview', { params: { url: sourceUrl } })
      .then((res) => {
        if (!cancelled) setImageUrl(res.data?.data?.imageUrl || '')
      })
      .catch(() => {
        if (!cancelled) setImageUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [displayProduct?.ma, displayProduct?.urlLink, extraInfo.WebsiteLink, mainInfo.WebsiteLink, mainInfo.URLLink])

  const tabSections = useMemo(() => profile?.sections?.[activeTab] || [], [profile, activeTab])

  if (!displayProduct) return null

  const websiteLink = firstValidLink(mainInfo.WebsiteLink, extraInfo.WebsiteLink, displayProduct.urlLink, mainInfo.URLLink)
  const actualImageLink = firstValidLink(mainInfo.AnhThucTeLink, extraInfo.AnhThucTeLink)
  const name = displayProduct.ten || mainInfo.Ten || '-'
  const code = displayProduct.ma || mainInfo.Ma || '-'

  return (
    <div className="modal-backdrop">
      <button type="button" className="modal-scrim" onClick={onClose} aria-label="Đóng hồ sơ sản phẩm" />

      <div className="product-editor-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <header className="product-editor-header">
          <div>
            <h2 id="product-modal-title">{name}</h2>
            <span>{code}</span>
          </div>
          <div className="product-editor-toolbar">
            <button type="button" disabled>+ Thêm mới</button>
            <button type="button" disabled>▣ Lưu hàng</button>
            <button type="button" className="product-editor-close" onClick={onClose} aria-label="Đóng">×</button>
          </div>
        </header>

        <div className="product-editor-body">
          <section className="product-editor-top">
            <div className="product-editor-grid">
              <ReadOnlyField label="Mã hàng (Mã vạch)" value={code} strong />
              <ReadOnlyField label="Tên hàng" value={name} strong wide />
              <ReadOnlyField label="Mã tay" value={displayProduct.ma1 || mainInfo.Ma1} />
              <ReadOnlyField label="Nhóm hàng" value={displayProduct.tenNhomHang || mainInfo.TenNhomHang || mainInfo.NhomHang} />
              <ReadOnlyField label="ĐVT" value={displayProduct.dvt || mainInfo.DVT} />
              <ReadOnlyField label="Tình trạng" value={formatStatus(displayProduct.tinhTrang ?? mainInfo.TinhTrang)} />
            </div>

            <div className="product-editor-image">
              {imageUrl && !imageError
                ? <img src={imageUrl} alt={name} onError={() => setImageError(true)} />
                : <div className="product-editor-no-image">ECO3D</div>}
            </div>

            <div className="product-editor-price">
              <div className="price-title">Đơn giá sản phẩm</div>
              <div className="price-action-column">
                <button type="button" disabled>Tính giá bán</button>
                <button type="button" disabled>Nhân đôi</button>
              </div>
              <ReadOnlyField label="Giá bán lẻ" value={formatMoney(displayProduct.giaLe ?? mainInfo.GiaLe)} />
              <ReadOnlyField label="Giá bán buôn" value={formatMoney(displayProduct.giaSi ?? mainInfo.Giasi ?? mainInfo.GiaSi)} />
              <ReadOnlyField label="Giá nhập" value={formatMoney(displayProduct.giaNhap ?? mainInfo.GiaNhap)} />
              <ReadOnlyField label="Khuyến mại bán lẻ" value={formatNumberValue(mainInfo.KhuyenMaiBanLe)} />
              <ReadOnlyField label="Khuyến mại bán buôn" value={formatNumberValue(mainInfo.KhuyenMaiBanBuon)} />
              <ReadOnlyField label="Khuyến mại giá nhập" value={formatNumberValue(mainInfo.KhuyenMaiNhap)} />
              <ReadOnlyField label="Giá đại lý cấp 1" value={formatMoney(displayProduct.cap1 ?? mainInfo.Cap1)} />
              <ReadOnlyField label="Cấp 2" value={formatMoney(displayProduct.cap2 ?? mainInfo.Cap2)} />
              <ReadOnlyField label="Cấp 3" value={formatMoney(displayProduct.cap3 ?? mainInfo.Cap3)} />
              <ReadOnlyField label="Cấp 4" value={formatMoney(displayProduct.cap4 ?? mainInfo.Cap4)} />
            </div>
          </section>

          <section className="product-editor-links">
            <ProductDescription value={displayProduct.moTa || mainInfo.MoTa} />
            <ProductLinkRow label="Link website:" href={websiteLink} text="Mở trang sản phẩm" />
            <ProductLinkRow label="Ảnh thực tế:" href={actualImageLink} text="Mở ảnh thực tế" />
          </section>

          <nav className="product-editor-tabs" role="tablist" aria-label="Hồ sơ sản phẩm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'active' : ''}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="product-editor-tab-panel" role="tabpanel">
            {loading && <p className="modal-muted">Đang tải hồ sơ sản phẩm...</p>}
            {!loading && activeTab === 'info' && (
              <>
                <InfoSummary product={displayProduct} mainInfo={mainInfo} />
                <DataSection title="Dữ liệu chi tiết từ DM_HangHoa" rows={[mainInfo]} />
              </>
            )}
            {!loading && activeTab !== 'info' && (
              tabSections.length > 0
                ? tabSections.map((section) => (
                  <DataSection key={section.title} title={section.title} rows={section.rows || []} />
                ))
                : <EmptyTab />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoSummary({ product, mainInfo }) {
  return (
    <section className="product-editor-summary">
      <ReadOnlyField label="Tên tiếng Anh" value={mainInfo.TenTiengAnh} />
      <ReadOnlyField label="Tên tiếng Nhật" value={mainInfo.TenTiengNhat} />
      <ReadOnlyField label="Mã cũ" value={mainInfo.MaCu} />
      <ReadOnlyField label="Mã liên kết" value={mainInfo.MaLienKet} />
      <ReadOnlyField label="Hãng sản xuất" value={product.tenHangSX || mainInfo.TenHangSX} />
      <ReadOnlyField label="Nước sản xuất" value={mainInfo.TenNuocSX || mainInfo.NuocSX} />
      <ReadOnlyField label="Loại hàng" value={mainInfo.TenLoaiHang || mainInfo.LoaiHang} />
      <ReadOnlyField label="Nhân viên" value={mainInfo.TenNhanVien || mainInfo.NhanVien} />
    </section>
  )
}

function DataSection({ title, rows }) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : []
  const columns = getColumns(safeRows)

  return (
    <section className="product-data-section">
      <h3>{title}</h3>
      {safeRows.length === 0 ? (
        <p className="modal-muted">Chưa có dữ liệu.</p>
      ) : safeRows.length === 1 ? (
        <div className="product-field-matrix">
          {columns.map((column) => (
            <ReadOnlyField key={column} label={labelFor(column)} value={formatCell(column, safeRows[0][column], safeRows[0])} />
          ))}
        </div>
      ) : (
        <div className="product-data-table-wrap">
          <table className="product-data-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column}>{labelFor(column)}</th>)}
              </tr>
            </thead>
            <tbody>
              {safeRows.map((row, index) => (
                <tr key={row.ID || row.Id || `${title}-${index}`}>
                  {columns.map((column) => <td key={column}>{formatCell(column, row[column], row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function EmptyTab() {
  return (
    <section className="product-data-section">
      <p className="modal-muted">Chưa có dữ liệu trong nhóm này.</p>
    </section>
  )
}

function ReadOnlyField({ label, value, strong = false, wide = false }) {
  const displayValue = isReactNode(value) ? value : formatDisplayValue(value)
  return (
    <div className={`readonly-field${wide ? ' wide' : ''}${strong ? ' strong' : ''}`}>
      <span>{label}</span>
      <strong>{displayValue}</strong>
    </div>
  )
}

function ProductDescription({ value }) {
  const lines = descriptionLines(value)
  if (!lines.length) return null

  return (
    <div className="product-editor-description">
      <span>Mô tả:</span>
      <ul>
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </div>
  )
}

function ProductLinkRow({ label, href, text }) {
  return (
    <div className="product-link-row">
      <span>{label}</span>
      {href ? <a href={href} target="_blank" rel="noreferrer">{text}</a> : <strong />}
    </div>
  )
}

function getColumns(rows) {
  const columns = []
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (!columns.includes(key) && hasValue(row[key]) && !shouldHideCompanionColumn(key, row)) columns.push(key)
    })
  })
  return columns
}

function shouldHideCompanionColumn(column, row) {
  if (!companionLookupColumns.has(column)) return false
  return Object.entries(lookupColumns).some(([codeColumn, nameColumns]) => (
    nameColumns.includes(column) && hasValue(row?.[codeColumn])
  ))
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function labelFor(column) {
  return fieldLabels[column] || splitCamelCase(column)
}

function splitCamelCase(value) {
  return String(value || '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function formatCell(column, value, row = {}) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  const lookupValue = formatLookupCell(column, value, row)
  if (lookupValue) return lookupValue
  if (isLinkColumn(column) && isLinkValue(value)) return <InlineLink href={String(value)} />
  if (column === 'TinhTrang') return formatStatus(value)
  if (moneyColumns.has(column)) return formatMoney(value)
  if (dateColumns.has(column)) return formatDateValue(value)
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}

function InlineLink({ href }) {
  const target = normalizeLink(href)
  return (
    <a className="inline-data-link" href={target} target="_blank" rel="noreferrer">
      {href}
    </a>
  )
}

function isReactNode(value) {
  return value && typeof value === 'object' && '$$typeof' in value
}

function isLinkColumn(column) {
  return /url|link|website|copylink|imageurl/i.test(column)
}

function isLinkValue(value) {
  const text = String(value || '').trim()
  return /^(https?:\/\/|\/|~\/)/i.test(text)
}

function normalizeLink(value) {
  const text = String(value || '').trim()
  if (/^https?:\/\//i.test(text)) return text
  return text.replace(/^~\//, '/')
}

function formatLookupCell(column, value, row) {
  const nameColumns = lookupColumns[column]
  if (!nameColumns) return ''
  const name = nameColumns.map((nameColumn) => row?.[nameColumn]).find(hasValue)
  if (!name) return ''
  const cleanName = String(name).trim()
  const cleanCode = String(value).trim()
  if (!cleanCode || cleanName === cleanCode) return cleanName
  return `${cleanName} (${cleanCode})`
}

function formatStatus(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Đang dùng' : 'Ngừng dùng'
  const numeric = Number(value)
  if (!Number.isNaN(numeric)) return numeric > 0 ? 'Đang dùng' : 'Ngừng dùng'
  return String(value)
}

function formatNumberValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  return formatNumber(value)
}

function formatDateValue(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function isImageUrl(url) {
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url)
}

function descriptionLines(value) {
  const text = String(value || '').replace(/\r\n/g, '\n').trim()
  if (!text) return []
  if (text.includes('\n')) {
    return text
      .split('\n')
      .map((line) => line.trim().replace(/^[-•]\s*/, ''))
      .filter(Boolean)
  }
  const withoutLeadingDash = text.replace(/^-\s*/, '')
  const parts = withoutLeadingDash.split(/\s+-\s+/).map((line) => line.trim()).filter(Boolean)
  return parts.length > 1 ? parts : [text]
}

function firstValidLink(...values) {
  return values
    .map((value) => String(value || '').trim())
    .find((value) => /^https?:\/\//i.test(value)) || ''
}
