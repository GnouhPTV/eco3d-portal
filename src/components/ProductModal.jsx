import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { formatMoney, formatNumber } from '../utils/format.js'

const tabs = [
  { id: 'info', label: 'Thông tin' },
  { id: 'pricing', label: 'Giá bán' },
  { id: 'stock', label: 'Tồn kho' },
  { id: 'specs', label: 'Quy cách' },
  { id: 'supplier', label: 'Nhà cung cấp' },
  { id: 'system', label: 'Hệ thống' },
]

export default function ProductModal({ product, onClose }) {
  const [detailProduct, setDetailProduct] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const displayProduct = detailProduct || product

  useEffect(() => {
    let cancelled = false

    setDetailProduct(product)
    setActiveTab('info')
    if (!product?.ma) return undefined

    api.get(`/products/${encodeURIComponent(product.ma)}`)
      .then(res => {
        if (!cancelled) setDetailProduct(res.data?.data || product)
      })
      .catch(() => {
        if (!cancelled) setDetailProduct(product)
      })

    return () => {
      cancelled = true
    }
  }, [product])

  useEffect(() => {
    let cancelled = false
    const sourceUrl = displayProduct?.urlLink?.trim() || ''

    setImageUrl('')
    setImageError(false)

    if (!sourceUrl) return undefined

    if (isImageUrl(sourceUrl)) {
      setImageUrl(sourceUrl)
      return undefined
    }

    api.get('/products/image-preview', { params: { url: sourceUrl } })
      .then(res => {
        if (!cancelled) setImageUrl(res.data?.data?.imageUrl || '')
      })
      .catch(() => {
        if (!cancelled) setImageUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [displayProduct?.urlLink])

  if (!displayProduct) return null

  const extraInfo = displayProduct.extraInfo || {}

  return (
    <div className="modal-backdrop">
      <button type="button" className="modal-scrim" onClick={onClose} aria-label="Đóng hồ sơ sản phẩm" />
      <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">×</button>

        <div className="modal-image">
          {imageUrl && !imageError
            ? <img src={imageUrl} alt={displayProduct.ten} onError={() => setImageError(true)} />
            : <div className="no-image">ECO3D</div>}
        </div>

        <div className="modal-content">
          <div className="profile-header">
            <span className="modal-code">{displayProduct.ma}</span>
            <h2 id="product-modal-title">{displayProduct.ten}</h2>
            <div className="product-tags">
              <span className="tag group-tag">{displayProduct.tenNhomHang || '-'}</span>
              <span className="tag brand-tag">{displayProduct.tenHangSX || '-'}</span>
              <span className="tag unit-tag">ĐVT: {displayProduct.dvt || '-'}</span>
            </div>
            <p>{displayProduct.moTa || 'Chưa có mô tả.'}</p>
            <div className="profile-key-facts">
              <Info label="Nước sản xuất" value={formatLookup(extraInfo.TenNuocSX)} />
              <Info label="Loại hàng" value={formatLookup(extraInfo.TenLoaiHang)} />
              <Info label="Nhân viên" value={formatLookup(extraInfo.TenNhanVien)} />
            </div>
            {displayProduct.urlLink && (
              <a className="product-link" href={displayProduct.urlLink} target="_blank" rel="noreferrer">
                Mở trang sản phẩm
              </a>
            )}
          </div>

          <div className="profile-tabs" role="tablist" aria-label="Nhóm thông tin hồ sơ sản phẩm">
            {tabs.map(tab => (
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
          </div>

          <div className="profile-tab-panel" role="tabpanel">
            {activeTab === 'info' && (
              <InfoSection
                title="Thông tin chính"
                items={[
                  ['Mã hàng', displayProduct.ma],
                  ['Mã phụ / mã vạch', displayProduct.ma1],
                  ['Mã cũ', extraInfo.MaCu],
                  ['Mã liên kết', extraInfo.MaLienKet],
                  ['Tên tiếng Anh', extraInfo.TenTiengAnh],
                  ['Tên tiếng Nhật', extraInfo.TenTiengNhat],
                  ['Nhóm hàng', displayProduct.tenNhomHang],
                  ['Nhóm hàng 1', extraInfo.NhomHang1],
                  ['Nhóm hàng 2', extraInfo.NhomHang2],
                  ['Hãng sản xuất', displayProduct.tenHangSX],
                  ['Nước sản xuất', formatLookup(extraInfo.TenNuocSX)],
                  ['Đơn vị tính', displayProduct.dvt],
                  ['Loại hàng', formatLookup(extraInfo.TenLoaiHang)],
                  ['Tình trạng', displayProduct.tinhTrang ? 'Đang dùng' : 'Ngừng dùng'],
                ]}
              />
            )}

            {activeTab === 'pricing' && (
              <>
                <section className="profile-section">
                  <h3>Giá bán và cấp đại lý</h3>
                  <div className="price-grid">
                    <Price label="Giá lẻ" value={displayProduct.giaLe} />
                    <Price label="Giá sỉ" value={displayProduct.giaSi} />
                    <Price label="Giá nhập" value={displayProduct.giaNhap} />
                    <Price label="Giá niêm yết" value={extraInfo.GiaNiemYet} />
                    <Price label="Giá net" value={extraInfo.GiaNet} />
                    <Price label="In báo giá" value={extraInfo.InBaoGia} />
                    <Price label="Cấp 1" value={displayProduct.cap1} />
                    <Price label="Cấp 2" value={displayProduct.cap2} />
                    <Price label="Cấp 3" value={displayProduct.cap3} />
                    <Price label="Cấp 4" value={displayProduct.cap4} />
                    <Price label="Hoa hồng" value={extraInfo.HoaHong} />
                    <Info label="VAT" value={formatPercent(extraInfo.VAT)} />
                  </div>
                </section>

                <InfoSection
                  title="Khuyến mãi và thuế"
                  items={[
                    ['Khuyến mãi nhập', formatNumberValue(extraInfo.KhuyenMaiNhap)],
                    ['Khuyến mãi bán lẻ', formatNumberValue(extraInfo.KhuyenMaiBanLe)],
                    ['Khuyến mãi bán buôn', formatNumberValue(extraInfo.KhuyenMaiBanBuon)],
                    ['Mức thuế', formatPercent(extraInfo.MucThue)],
                    ['Không tính thuế', formatBoolean(extraInfo.KhongTinhThue)],
                    ['Đồng bộ giá', formatBoolean(extraInfo.DongBoGia)],
                  ]}
                />
              </>
            )}

            {activeTab === 'stock' && (
              <>
                <div className="stock-line">
                  <span>Tồn kho: <strong>{formatNumber(displayProduct.slTon)}</strong></span>
                  <span>Đã bán: <strong>{formatNumber(displayProduct.slBan)}</strong></span>
                  <span>Tồn tối thiểu: <strong>{formatNumber(displayProduct.tonToiThieu)}</strong></span>
                  <span>Tồn tối đa: <strong>{formatNumber(displayProduct.tonToiDa)}</strong></span>
                </div>

                <div className="warehouse-stock">
                  <h3>Tồn kho theo kho</h3>
                  {(displayProduct.warehouseStocks || []).length > 0 ? (
                    <div className="warehouse-list">
                      {displayProduct.warehouseStocks.map(stock => (
                        <div key={`${stock.maKho}-${stock.tenKho}`}>
                          <span>{stock.tenKho || stock.maKho}</span>
                          <strong>{formatNumber(stock.slTon)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Chưa có dữ liệu tồn kho theo kho.</p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'specs' && (
              <InfoSection
                title="Quy cách và thuộc tính"
                items={[
                  ['Quy cách', displayProduct.quiCach],
                  ['Quy cách thùng', extraInfo.QuiCach_Thung],
                  ['Kích cỡ', extraInfo.KichCo],
                  ['Kích thước', extraInfo.KichThuoc],
                  ['Màu sắc', extraInfo.MauSac],
                  ['Trọng lượng', extraInfo.TrongLuong],
                  ['Công suất', extraInfo.CongSuat],
                  ['Quang thông', extraInfo.QuangThong],
                  ['Hạn sử dụng', extraInfo.HanSuDung],
                  ['SL 1 lô', formatNumberValue(extraInfo.SLg1Lo)],
                  ['Số lượng một ngày', formatNumberValue(extraInfo.SoLuongMotNgay)],
                  ['Visa', extraInfo.ViSa],
                  ['HSDC', formatNumberValue(extraInfo.HSDC)],
                ]}
              />
            )}

            {activeTab === 'supplier' && (
              <InfoSection
                title="Nhà cung cấp và vận hành"
                items={[
                  ['Nhà cung cấp', extraInfo.TenNhaCC],
                  ['Phương án giá', extraInfo.PhuongAnGia],
                  ['Nhân viên', formatLookup(extraInfo.TenNhanVien)],
                  ['Là dịch vụ', formatBoolean(extraInfo.LaDichVu)],
                  ['Vật tư', formatBoolean(extraInfo.VatTu)],
                  ['Xuất nhập tồn', formatBoolean(extraInfo.XNT)],
                  ['Quản lý lô', formatBoolean(extraInfo.QuanLyLo)],
                  ['Upload web', formatBoolean(extraInfo.UploadWeb)],
                  ['Giới hạn tồn TT', formatNumberValue(extraInfo.GHTonTT)],
                  ['Giới hạn tồn TD', formatNumberValue(extraInfo.GHTonTD)],
                ]}
              />
            )}

            {activeTab === 'system' && (
              <InfoSection
                title="Mô tả và hệ thống"
                items={[
                  ['Từ khóa', displayProduct.keyword],
                  ['Mô tả tiếng Anh', extraInfo.MoTa_EN],
                  ['Ngày phát sinh', formatDateValue(extraInfo.NgayPS)],
                  ['Ngày tạo', formatDateValue(extraInfo.Date1)],
                  ['Ngày cập nhật', formatDateValue(extraInfo.Date2)],
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return <div><span>{label}</span><strong>{formatDisplayValue(value)}</strong></div>
}

function Price({ label, value }) {
  return <div><span>{label}</span><strong>{formatMoney(value)}</strong></div>
}

function InfoSection({ title, items }) {
  return (
    <section className="profile-section">
      <h3>{title}</h3>
      <div className="detail-grid">
        {items.map(([label, value]) => (
          <Info key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  )
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  return String(value)
}

function formatLookup(name) {
  const cleanName = name === null || name === undefined ? '' : String(name).trim()
  return cleanName || '-'
}

function formatBoolean(value) {
  if (value === null || value === undefined || value === '') return '-'
  return value ? 'Có' : 'Không'
}

function formatNumberValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  return formatNumber(value)
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '-'
  return `${formatNumber(value)}%`
}

function formatDateValue(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function isImageUrl(url) {
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url)
}
