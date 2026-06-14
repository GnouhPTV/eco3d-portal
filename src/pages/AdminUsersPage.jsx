import { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import { useAuth } from '../state/AuthContext.jsx'

const initialCreateForm = {
  username: '',
  password: '',
  confirmPassword: '',
  employeeCode: '',
  admin: false,
}

const initialLinkForm = {
  userId: '',
  employeeCode: '',
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [linkForm, setLinkForm] = useState(initialLinkForm)
  const [employees, setEmployees] = useState([])
  const [employeeDetails, setEmployeeDetails] = useState([])
  const [users, setUsers] = useState([])
  const [profileEmployee, setProfileEmployee] = useState(null)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeeLinkFilter, setEmployeeLinkFilter] = useState('all')
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [linking, setLinking] = useState(false)

  const canManage = isAccountCreator(user)
  const linkedEmployeeCodes = useMemo(
    () => new Map(users.map((item) => [item.nhanVien, item]).filter(([code]) => Boolean(code))),
    [users],
  )
  const selectedNewEmployee = useMemo(
    () => employees.find((item) => item.ma === createForm.employeeCode),
    [employees, createForm.employeeCode],
  )
  const selectedLinkAccount = useMemo(
    () => users.find((item) => String(item.key1) === String(linkForm.userId)),
    [users, linkForm.userId],
  )
  const selectedLinkEmployee = useMemo(
    () => employees.find((item) => item.ma === linkForm.employeeCode),
    [employees, linkForm.employeeCode],
  )
  const filteredEmployeeDetails = useMemo(() => {
    const keyword = normalizeText(employeeSearch)
    return employeeDetails.filter((employee) => {
      const code = getEmployeeCode(employee)
      const linkedAccount = linkedEmployeeCodes.get(code)
      const status = getEmployeeStatus(employee)
      const text = normalizeText(Object.values(employee).join(' '))

      if (keyword && !text.includes(keyword)) return false
      if (employeeLinkFilter === 'linked' && !linkedAccount) return false
      if (employeeLinkFilter === 'unlinked' && linkedAccount) return false
      if (employeeStatusFilter === 'active' && status !== 'active') return false
      if (employeeStatusFilter === 'inactive' && status !== 'inactive') return false
      return true
    })
  }, [employeeDetails, employeeSearch, employeeLinkFilter, employeeStatusFilter, linkedEmployeeCodes])

  useEffect(() => {
    if (canManage) loadData()
  }, [canManage])

  async function loadData() {
    setError('')
    try {
      const [employeeRes, employeeDetailRes, userRes] = await Promise.all([
        api.get('/auth/employees'),
        api.get('/auth/employees/details'),
        api.get('/auth/users'),
      ])
      setEmployees(employeeRes.data?.data || [])
      setEmployeeDetails(employeeDetailRes.data?.data || [])
      setUsers(userRes.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được dữ liệu tài khoản')
    }
  }

  function updateCreateField(field, value) {
    setCreateForm((current) => ({ ...current, [field]: value }))
  }

  function updateLinkField(field, value) {
    setLinkForm((current) => ({ ...current, [field]: value }))
  }

  function showProfile(employee) {
    setProfileEmployee(employee)
  }

  function useEmployeeForLink(employee) {
    setLinkForm((current) => ({ ...current, employeeCode: getEmployeeCode(employee) }))
  }

  function handleEmployeeSaved(updatedEmployee) {
    const code = getEmployeeCode(updatedEmployee)
    setEmployeeDetails((current) => current.map((employee) => (
      getEmployeeCode(employee) === code ? updatedEmployee : employee
    )))
    setProfileEmployee(updatedEmployee)
    loadData()
  }

  async function submitCreate(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (createForm.password !== createForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (!isStrongPassword(createForm.password)) {
      setError('Mật khẩu cần tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt')
      return
    }
    if (createForm.employeeCode && linkedEmployeeCodes.has(createForm.employeeCode)) {
      setError('Nhân viên này đã được gắn với một tài khoản khác')
      return
    }

    setCreating(true)
    try {
      const res = await api.post('/auth/users', {
        username: createForm.username,
        password: createForm.password,
        employeeCode: createForm.employeeCode || null,
        admin: createForm.admin,
      })
      setMessage(res.data?.message || 'Tạo tài khoản thành công')
      setUsers((current) => [res.data.data, ...current])
      setCreateForm(initialCreateForm)
    } catch (err) {
      setError(err.response?.data?.message || 'Không tạo được tài khoản')
    } finally {
      setCreating(false)
    }
  }

  async function submitLink(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!linkForm.userId) {
      setError('Vui lòng chọn tài khoản cần gắn nhân viên')
      return
    }
    if (!linkForm.employeeCode) {
      setError('Vui lòng chọn nhân viên cần gắn')
      return
    }
    if (isLinkedByAnotherAccount(linkForm.employeeCode, linkForm.userId, linkedEmployeeCodes)) {
      setError('Nhân viên này đã được gắn với một tài khoản khác')
      return
    }

    setLinking(true)
    try {
      const res = await api.put('/auth/users/link-employee', {
        userId: Number(linkForm.userId),
        employeeCode: linkForm.employeeCode,
      })
      const updatedAccount = res.data?.data
      setMessage(res.data?.message || 'Cập nhật liên kết nhân viên thành công')
      setUsers((current) => current.map((account) => (
        account.key1 === updatedAccount.key1 ? updatedAccount : account
      )))
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được liên kết nhân viên')
    } finally {
      setLinking(false)
    }
  }

  if (!canManage) {
    return (
      <section className="page-section">
        <div className="alert error">Chỉ Administrator hoặc Administrators mới được tạo và gắn tài khoản nhân viên.</div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="section-title">
        <h2>Tài khoản nhân viên</h2>
        <p>Tạo tài khoản, gắn hồ sơ nhân viên và xem thông tin từ SQL Server.</p>
      </div>

      <div className="admin-user-layout">
        <form className="form-card admin-user-form" onSubmit={submitCreate}>
          <h3>Tạo tài khoản mới</h3>

          <label>Tên đăng nhập</label>
          <input value={createForm.username} onChange={(e) => updateCreateField('username', e.target.value)} placeholder="VD: sale01" required />

          <label>Gắn tài khoản mới với nhân viên</label>
          <select value={createForm.employeeCode} onChange={(e) => updateCreateField('employeeCode', e.target.value)}>
            <option value="">Không gắn nhân viên</option>
            {employees.map((employee) => {
              const linked = linkedEmployeeCodes.has(employee.ma)
              return (
                <option key={employee.ma} value={employee.ma} disabled={linked}>
                  {employeeLabel(employee)}{linked ? ' - đã có tài khoản' : ''}
                </option>
              )
            })}
          </select>

          {selectedNewEmployee && <EmployeePreview employee={selectedNewEmployee} title="Nhân viên sẽ gắn cho tài khoản mới" />}

          <label>Mật khẩu</label>
          <input type="password" value={createForm.password} onChange={(e) => updateCreateField('password', e.target.value)} required />

          <label>Nhập lại mật khẩu</label>
          <input type="password" value={createForm.confirmPassword} onChange={(e) => updateCreateField('confirmPassword', e.target.value)} required />

          <label className="check-row">
            <input type="checkbox" checked={createForm.admin} onChange={(e) => updateCreateField('admin', e.target.checked)} />
            <span>Cấp quyền quản trị</span>
          </label>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <button type="submit" className="primary-btn" disabled={creating}>{creating ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
        </form>

        <form className="employee-link-card" onSubmit={submitLink}>
          <h3>Gắn nhân viên với tài khoản có sẵn</h3>
          <p>Chọn tài khoản đã tạo, sau đó chọn hồ sơ nhân viên để cập nhật liên kết. Không cần nhập lại mật khẩu.</p>

          <label>Tài khoản cần gắn</label>
          <select value={linkForm.userId} onChange={(e) => updateLinkField('userId', e.target.value)}>
            <option value="">Chọn tài khoản</option>
            {users.map((account) => (
              <option key={account.key1} value={account.key1}>
                {account.ten}{account.tenNhanVien ? ` - ${account.tenNhanVien}` : ' - chưa gắn nhân viên'}
              </option>
            ))}
          </select>

          <label>Nhân viên cần gắn</label>
          <select value={linkForm.employeeCode} onChange={(e) => updateLinkField('employeeCode', e.target.value)}>
            <option value="">Chọn nhân viên</option>
            {employees.map((employee) => {
              const linkedByOther = isLinkedByAnotherAccount(employee.ma, linkForm.userId, linkedEmployeeCodes)
              return (
                <option key={employee.ma} value={employee.ma} disabled={linkedByOther}>
                  {employeeLabel(employee)}{linkedByOther ? ' - đã có tài khoản' : ''}
                </option>
              )
            })}
          </select>

          {selectedLinkAccount && (
            <div className="employee-link-summary">
              <span>Tài khoản đang chọn</span>
              <strong>{selectedLinkAccount.ten}</strong>
              <span>Liên kết hiện tại</span>
              <strong>{selectedLinkAccount.tenNhanVien || selectedLinkAccount.nhanVien || 'Chưa gắn nhân viên'}</strong>
            </div>
          )}

          {selectedLinkEmployee && <EmployeePreview employee={selectedLinkEmployee} title="Nhân viên sẽ được gắn" />}

          <button type="submit" className="primary-btn" disabled={linking}>{linking ? 'Đang cập nhật...' : 'Cập nhật liên kết'}</button>
        </form>

        <div className="table-card employee-directory-card">
          <div className="table-header">
            <span>Danh sách nhân viên</span>
            <button type="button" className="ghost-btn" onClick={loadData}>Tải lại</button>
          </div>

          <div className="employee-filter-bar">
            <label>
              Tìm kiếm
              <input value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} placeholder="Tên, mã nhân viên, bộ phận..." />
            </label>
            <label>
              Lọc nhân viên
              <select value={employeeLinkFilter} onChange={(e) => setEmployeeLinkFilter(e.target.value)}>
                <option value="all">Tất cả nhân viên</option>
                <option value="linked">Đã gắn tài khoản</option>
                <option value="unlinked">Chưa gắn tài khoản</option>
              </select>
            </label>
            <label>
              Trạng thái
              <select value={employeeStatusFilter} onChange={(e) => setEmployeeStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang dùng</option>
                <option value="inactive">Ngừng dùng</option>
              </select>
            </label>
          </div>

          <div className="desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Mã nhân viên</th>
                  <th>Họ tên</th>
                  <th>Bộ phận / vai trò</th>
                  <th>Tài khoản</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployeeDetails.map((employee) => {
                  const code = getEmployeeCode(employee)
                  const linkedAccount = linkedEmployeeCodes.get(code)
                  const status = getEmployeeStatus(employee)
                  return (
                    <tr key={code || JSON.stringify(employee)}>
                      <td><strong>{code || '-'}</strong></td>
                      <td>{getEmployeeName(employee)}</td>
                      <td>{getEmployeeRole(employee)}</td>
                      <td>{linkedAccount ? linkedAccount.ten : 'Chưa gắn tài khoản'}</td>
                      <td><span className={status === 'active' ? 'stock ok' : 'stock empty'}>{status === 'active' ? 'Đang dùng' : 'Ngừng dùng'}</span></td>
                      <td className="action-cell">
                        <button type="button" className="small-action-btn" onClick={() => showProfile(employee)}>Xem hồ sơ</button>
                        <button type="button" className="small-action-btn" onClick={() => useEmployeeForLink(employee)}>Dùng để gắn</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {profileEmployee && (
        <EmployeeProfileModal
          employee={profileEmployee}
          linkedAccount={linkedEmployeeCodes.get(getEmployeeCode(profileEmployee))}
          onClose={() => setProfileEmployee(null)}
          onSaved={handleEmployeeSaved}
          onUseForLink={() => {
            useEmployeeForLink(profileEmployee)
            setProfileEmployee(null)
          }}
        />
      )}
    </section>
  )
}

const EMPLOYEE_EDIT_GROUPS = [
  {
    title: 'Thông tin cá nhân',
    fields: [
      { key: 'Ten', label: 'Họ tên', type: 'text' },
      { key: 'HoDem', label: 'Họ đệm', type: 'text' },
      { key: 'TenGoi', label: 'Tên gọi', type: 'text' },
      { key: 'DienThoai', label: 'Điện thoại', type: 'text' },
      { key: 'Email', label: 'Email', type: 'email' },
      { key: 'DiaChi', label: 'Địa chỉ', type: 'text' },
      { key: 'NgaySinh', label: 'Ngày sinh', type: 'date' },
      { key: 'SoCMT', label: 'Số giấy tờ', type: 'text' },
      { key: 'NgayCMT', label: 'Ngày cấp giấy tờ', type: 'date' },
      { key: 'NoiCapCMT', label: 'Nơi cấp giấy tờ', type: 'text' },
    ],
  },
  {
    title: 'Công việc',
    fields: [
      { key: 'OK', label: 'Trạng thái sử dụng', type: 'boolean' },
      { key: 'TrangThai', label: 'Trạng thái làm việc', type: 'boolean' },
      { key: 'Chucvu', label: 'Chức vụ', type: 'select', options: 'positions' },
      { key: 'Id_BoPhan', label: 'Bộ phận', type: 'select', options: 'departments' },
      { key: 'IDCuaHang', label: 'Cửa hàng', type: 'select', options: 'stores' },
      { key: 'Kho', label: 'Kho', type: 'select', options: 'warehouses' },
      { key: 'NgayLamViec', label: 'Ngày vào làm', type: 'date' },
      { key: 'NhomQuanLy', label: 'Nhóm quản lý', type: 'multi-select', options: 'employees' },
      { key: 'NhomThuong', label: 'Nhóm thưởng', type: 'number' },
      { key: 'ViTri', label: 'Vị trí', type: 'number' },
      { key: 'TrangChu', label: 'Trang chủ', type: 'boolean' },
      { key: 'TinhLuong', label: 'Tính lương', type: 'boolean' },
    ],
  },
  {
    title: 'Lương và ghi chú',
    fields: [
      { key: 'MucLuong', label: 'Mức lương', type: 'number' },
      { key: 'MucKhoan', label: 'Mức khoán', type: 'number' },
      { key: 'GioiHanNo', label: 'Giới hạn nợ', type: 'number' },
      { key: 'PhuCap1', label: 'Phụ cấp 1', type: 'number' },
      { key: 'PhuCap', label: 'Phụ cấp', type: 'number' },
      { key: 'CongTieuChuan', label: 'Công tiêu chuẩn', type: 'number' },
      { key: 'TongTrongSo', label: 'Tổng trọng số', type: 'number' },
      { key: 'NickYahoo', label: 'Nick Yahoo', type: 'text' },
      { key: 'NickSky', label: 'Nick Skype', type: 'text' },
      { key: 'GhiChu', label: 'Ghi chú', type: 'textarea' },
      { key: 'SQL_KPI', label: 'SQL KPI', type: 'textarea' },
    ],
  },
]

function EmployeeProfileModal({ employee, linkedAccount, onClose, onUseForLink, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [editValues, setEditValues] = useState({})
  const [editOptions, setEditOptions] = useState({})
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const entries = Object.entries(employee)

  async function startEdit() {
    setEditError('')
    try {
      const res = await api.get(`/auth/employees/${encodeURIComponent(getEmployeeCode(employee))}/edit`)
      setEditValues(res.data?.data?.values || {})
      setEditOptions(res.data?.data?.options || {})
      setEditing(true)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Không tải được dữ liệu chỉnh sửa')
    }
  }

  function updateEditValue(field, value) {
    setEditValues((current) => ({ ...current, [field]: value }))
  }

  async function saveEmployee(e) {
    e.preventDefault()
    setEditError('')
    setSaving(true)
    try {
      const res = await api.put(`/auth/employees/${encodeURIComponent(getEmployeeCode(employee))}`, editValues)
      onSaved(res.data?.data)
      setEditing(false)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Không cập nhật được hồ sơ nhân viên')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="employee-modal-scrim" role="presentation" onMouseDown={onClose}>
      <section className={editing ? 'employee-profile-modal editing' : 'employee-profile-modal'} role="dialog" aria-modal="true" aria-label="Hồ sơ nhân viên" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>

        <div className="employee-profile-head">
          <div>
            <span>{editing ? 'Chỉnh sửa hồ sơ nhân viên' : 'Hồ sơ nhân viên'}</span>
            <h3>{getEmployeeName(employee)}</h3>
            <p>{getEmployeeCode(employee) || '-'}</p>
          </div>
          <span className={getEmployeeStatus(employee) === 'active' ? 'stock ok' : 'stock empty'}>
            {getEmployeeStatus(employee) === 'active' ? 'Đang dùng' : 'Ngừng dùng'}
          </span>
        </div>

        {editError && <div className="alert error">{editError}</div>}

        {editing ? (
          <form className="employee-edit-form" onSubmit={saveEmployee}>
            {EMPLOYEE_EDIT_GROUPS.map((group) => (
              <section className="employee-edit-section" key={group.title}>
                <h4>{group.title}</h4>
                <div className="employee-edit-grid">
                  {group.fields.map((field) => (
                    <EmployeeEditField
                      key={field.key}
                      field={field}
                      value={editValues[field.key]}
                      options={editOptions[field.options] || []}
                      onChange={(value) => updateEditValue(field.key, value)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <div className="employee-modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setEditing(false)}>Hủy</button>
              <button type="submit" className="primary-btn" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="employee-profile-summary">
              <span>Tài khoản liên kết</span>
              <strong>{linkedAccount ? linkedAccount.ten : 'Chưa gắn tài khoản'}</strong>
              <span>Bộ phận / vai trò</span>
              <strong>{getEmployeeRole(employee)}</strong>
            </div>

            <div className="employee-field-grid">
              {entries.map(([key, value]) => (
                <div className="employee-field" key={key}>
                  <span>{formatColumnName(key)}</span>
                  <strong>{formatValue(value)}</strong>
                </div>
              ))}
            </div>

            <div className="employee-modal-actions">
              <button type="button" className="ghost-btn" onClick={onClose}>Đóng</button>
              <button type="button" className="ghost-btn" onClick={startEdit}>Chỉnh sửa hồ sơ</button>
              <button type="button" className="primary-btn" onClick={onUseForLink}>Dùng để gắn tài khoản</button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function EmployeeEditField({ field, value, options, onChange }) {
  if (field.type === 'boolean') {
    return (
      <label className="employee-edit-field">
        {field.label}
        <select value={value ? 'true' : 'false'} onChange={(e) => onChange(e.target.value === 'true')}>
          <option value="true">Có</option>
          <option value="false">Không</option>
        </select>
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <label className="employee-edit-field">
        {field.label}
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Không chọn</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    )
  }

  if (field.type === 'multi-select') {
    const selectedValues = Array.isArray(value) ? value : []
    return (
      <label className="employee-edit-field wide">
        {field.label}
        <select multiple value={selectedValues} onChange={(e) => onChange(Array.from(e.target.selectedOptions).map((option) => option.value))}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <small>Giữ Ctrl để chọn nhiều nhân viên.</small>
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <label className="employee-edit-field wide">
        {field.label}
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} />
      </label>
    )
  }

  return (
    <label className="employee-edit-field">
      {field.label}
      <input type={field.type} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function EmployeePreview({ employee, title }) {
  return (
    <div className="employee-link-detail compact">
      <h4>{title}</h4>
      <span>Mã nhân viên</span>
      <strong>{employee.ma || '-'}</strong>
      <span>Họ tên</span>
      <strong>{employee.ten || '-'}</strong>
      <span>Bộ phận / vai trò</span>
      <strong>{employee.role || employee.department || employee.position || '-'}</strong>
    </div>
  )
}

function getEmployeeCode(employee) {
  return getValue(employee, ['Mã nhân viên', 'Ma', 'MA', 'ma', 'MaNV', 'NhanVien']) || ''
}

function getEmployeeName(employee) {
  return getValue(employee, ['Họ tên', 'Ten', 'TEN', 'ten', 'HoTen', 'TenNhanVien']) || '-'
}

function getEmployeeRole(employee) {
  return getValue(employee, ['Chức vụ', 'Bộ phận', 'Vị trí', 'TenChucVu', 'ChucVu', 'ViTri', 'ChucDanh', 'TenBoPhan', 'BoPhan', 'PhongBan', 'TenPhongBan', 'Nhom', 'NhomNV']) || '-'
}

function getEmployeeStatus(employee) {
  const displayStatus = getValue(employee, ['Trạng thái sử dụng'])
  if (displayStatus) {
    const normalized = normalizeText(displayStatus)
    return normalized.includes('dang dung') || normalized.includes('co') ? 'active' : 'inactive'
  }
  const inactiveFields = ['DaXoa', 'NghiViec', 'DaNghi', 'ThoiViec', 'NghiLam', 'Inactive', 'Disabled', 'KhongSuDung']
  return inactiveFields.some((key) => isTruthyDbValue(getValue(employee, [key]))) ? 'inactive' : 'active'
}

function getValue(object, keys) {
  if (!object) return null
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      return object[key]
    }
  }
  const lowerKeys = keys.map((key) => key.toLowerCase())
  const match = Object.keys(object).find((key) => lowerKeys.includes(key.toLowerCase()))
  return match ? object[match] : null
}

function employeeLabel(employee) {
  const role = employee.role && employee.role !== '-' ? ` - ${employee.role}` : ''
  return `${employee.ten || employee.ma}${role}`
}

function isLinkedByAnotherAccount(employeeCode, userId, linkedEmployeeCodes) {
  const linkedAccount = linkedEmployeeCodes.get(employeeCode)
  return Boolean(linkedAccount) && String(linkedAccount.key1) !== String(userId)
}

function isAccountCreator(user) {
  const username = user?.ten || ''
  return username.toLowerCase() === 'administrator' || username.toLowerCase() === 'administrators'
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(password)
}

function isTruthyDbValue(value) {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y', 'co', 'có'].includes(value.trim().toLowerCase())
  }
  return false
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function formatColumnName(key) {
  return key.replace(/_/g, ' ')
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  return String(value)
}
