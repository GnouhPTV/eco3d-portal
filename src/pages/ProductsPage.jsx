import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import ProductModal from '../components/ProductModal.jsx'
import { formatMoney, formatNumber } from '../utils/format.js'

const defaultFilters = {
  keyword: '',
  group: '',
  manufacturer: '',
  priceFrom: '',
  priceTo: '',
  stockStatus: '',
  sort: 'name_asc',
}

export default function ProductsPage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [data, setData] = useState({ items: [], total: 0, totalPages: 0 })
  const [categories, setCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const params = useMemo(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    )
    return { ...cleanFilters, page, size }
  }, [filters, page, size])

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data.data || [])).catch(() => {})
    api.get('/products/manufacturers').then(res => setManufacturers(res.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get('/products', { params })
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Không tải được danh mục hàng hóa'))
      .finally(() => setLoading(false))
  }, [params])

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function resetFilters() {
    setFilters(defaultFilters)
    setPage(0)
  }

  function updateSize(value) {
    setSize(Number(value))
    setPage(0)
  }

  return (
    <section className="page-section products-page">
      <div className="section-title row-title">
        <div>
          <h2>Danh mục hàng hóa</h2>
          <p>Tìm kiếm, lọc và xem hồ sơ sản phẩm từ SQL Server ECO3D</p>
        </div>
        <button type="button" className="ghost-btn" onClick={resetFilters}>Xóa lọc</button>
      </div>

      <div className="filter-card">
        <label className="filter-field">
          <span>Tìm kiếm</span>
          <input
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            placeholder="Tên hàng hóa, mã sản phẩm..."
          />
        </label>
        <label className="filter-field">
          <span>Nhóm hàng</span>
          <select value={filters.group} onChange={(e) => updateFilter('group', e.target.value)}>
            <option value="">Tất cả nhóm</option>
            {categories.map(c => <option key={c.ma} value={c.ma}>{c.ten || 'Chưa có tên'}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Hãng sản xuất</span>
          <select value={filters.manufacturer} onChange={(e) => updateFilter('manufacturer', e.target.value)}>
            <option value="">Tất cả hãng</option>
            {manufacturers.map(m => <option key={m.ma} value={m.ma}>{m.ten || 'Chưa có tên'}</option>)}
          </select>
        </label>
        <label className="filter-field compact">
          <span>Giá từ</span>
          <input
            type="number"
            min="0"
            value={filters.priceFrom}
            onChange={(e) => updateFilter('priceFrom', e.target.value)}
            placeholder="VD: 100000"
          />
        </label>
        <label className="filter-field compact">
          <span>Giá đến</span>
          <input
            type="number"
            min="0"
            value={filters.priceTo}
            onChange={(e) => updateFilter('priceTo', e.target.value)}
            placeholder="VD: 500000"
          />
        </label>
        <label className="filter-field">
          <span>Tồn kho</span>
          <select value={filters.stockStatus} onChange={(e) => updateFilter('stockStatus', e.target.value)}>
            <option value="">Tất cả tồn kho</option>
            <option value="in_stock">Còn hàng</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="low_stock">Sắp hết hàng</option>
          </select>
        </label>
        <label className="filter-field">
          <span>Sắp xếp</span>
          <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
            <option value="latest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="sold_desc">Bán chạy</option>
            <option value="stock_desc">Tồn kho nhiều nhất</option>
            <option value="name_asc">Tên A-Z</option>
          </select>
        </label>
        <label className="filter-field">
          <span>Hiển thị</span>
          <select value={size} onChange={(e) => updateSize(e.target.value)}>
            <option value={20}>20 sản phẩm</option>
            <option value={50}>50 sản phẩm</option>
            <option value={100}>100 sản phẩm</option>
          </select>
        </label>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="table-card">
        <div className="table-header">
          <span>Tổng: <strong>{formatNumber(data.total)}</strong> sản phẩm</span>
          {loading && <span>Đang tải...</span>}
        </div>
        <div className="desktop-table">
          <table>
            <thead>
              <tr>
                <th className="col-stt">STT</th>
                <th className="col-code">Mã hàng</th>
                <th>Thông tin sản phẩm</th>
                <th className="col-price">Giá bán</th>
                <th className="col-stock">Kho</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.ma}>
                  <td className="stt-cell">{page * size + index + 1}</td>
                  <td>
                    <span className="code-pill">{item.ma}</span>
                    {item.ma1 && <small className="sub-code">{item.ma1}</small>}
                  </td>
                  <td>
                    <div className="product-info-cell">
                      <strong>{item.ten}</strong>
                      <div className="product-tags">
                        <span className="tag group-tag">{item.tenNhomHang || '-'}</span>
                        <span className="tag brand-tag">{item.tenHangSX || '-'}</span>
                        <span className="tag unit-tag">ĐVT: {item.dvt || '-'}</span>
                      </div>
                      <button type="button" className="small-btn" onClick={() => setSelectedProduct(item)}>Xem hồ sơ</button>
                    </div>
                  </td>
                  <td>
                    <div className="price-list">
                      <PriceLine label="Lẻ" value={item.giaLe} strong />
                      <PriceLine label="Sỉ" value={item.giaSi} strong />
                      <div className="price-levels">
                        <PriceLevel label="C1" value={item.cap1} />
                        <PriceLevel label="C2" value={item.cap2} />
                        <PriceLevel label="C3" value={item.cap3} />
                        <PriceLevel label="C4" value={item.cap4} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="stock-summary">
                      <div className="stock-row total">
                        <span>Tồn</span>
                        <strong>{formatNumber(item.slTon)}</strong>
                      </div>
                      <div className="stock-row sold">
                        <span>Bán</span>
                        <strong>{formatNumber(item.slBan)}</strong>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards">
          {data.items.map(item => (
            <div className="product-card" key={item.ma}>
              <div>
                <strong>{item.ten}</strong>
                <span>{item.ma} • {item.tenNhomHang || '-'}</span>
              </div>
              <div className="product-tags">
                <span className="tag brand-tag">{item.tenHangSX || '-'}</span>
                <span className="tag unit-tag">ĐVT: {item.dvt || '-'}</span>
              </div>
              <div className="product-meta">
                <span>Giá lẻ</span>
                <b>{formatMoney(item.giaLe || item.giaSi)}</b>
              </div>
              <div className="product-meta">
                <span>Giá sỉ</span>
                <b>{formatMoney(item.giaSi || item.cap1)}</b>
              </div>
              <div className="mobile-price-levels">
                <PriceLevel label="C1" value={item.cap1} />
                <PriceLevel label="C2" value={item.cap2} />
                <PriceLevel label="C3" value={item.cap3} />
                <PriceLevel label="C4" value={item.cap4} />
              </div>
              <div className="product-actions">
                <StockBadge value={item.slTon} />
                <button type="button" className="small-btn" onClick={() => setSelectedProduct(item)}>Xem hồ sơ</button>
              </div>
            </div>
          ))}
        </div>

        {!loading && data.items.length === 0 && <div className="empty-state">Không tìm thấy hàng hóa phù hợp.</div>}

        <div className="pagination">
          <button type="button" disabled={page <= 0} onClick={() => setPage(0)}>Đầu trang</button>
          <button type="button" disabled={page <= 0} onClick={() => setPage(p => p - 1)}>Trước</button>
          <span>Trang {page + 1} / {Math.max(data.totalPages, 1)}</span>
          <button type="button" disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
          <button type="button" disabled={page + 1 >= data.totalPages} onClick={() => setPage(Math.max(data.totalPages - 1, 0))}>Cuối trang</button>
        </div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}

function PriceLine({ label, value, strong = false }) {
  return (
    <div className="price-line">
      <span>{label}</span>
      {strong ? <strong>{formatMoney(value)}</strong> : <b>{formatMoney(value)}</b>}
    </div>
  )
}

function PriceLevel({ label, value }) {
  return (
    <div className="price-level">
      <span>{label}: {formatMoney(value)}</span>
    </div>
  )
}

function StockBadge({ value }) {
  const number = Number(value || 0)
  const cls = number > 0 ? 'stock ok' : 'stock empty'
  return <span className={cls}>{formatNumber(number)}</span>
}
