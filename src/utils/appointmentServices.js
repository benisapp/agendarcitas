// Helpers compartidos para servicios, adicionales y totales de una cita.
// Mantienen compatibilidad con datos viejos:
// - servicio sin `addons`   -> []
// - cita sin `addons`       -> []
// - adicional sin `quantity` -> 1

function normalizeAddonList(raw) {
  let list
  if (Array.isArray(raw)) {
    list = raw
  } else if (raw && typeof raw === 'object') {
    // Compatibilidad por si los adicionales se guardaron como mapa { id: {...} }.
    list = Object.entries(raw).map(([key, value]) => ({ id: key, ...value }))
  } else {
    list = []
  }

  return list
    .map((addon, index) => {
      if (!addon || typeof addon !== 'object') return null
      const id =
        addon.id != null && addon.id !== ''
          ? String(addon.id)
          : `addon-${index}`
      return { ...addon, id }
    })
    .filter(Boolean)
}

export function getServiceAddons(service) {
  return normalizeAddonList(service?.addons)
}

export function getAppointmentAddons(appointment) {
  return normalizeAddonList(appointment?.addons)
}

// Los adicionales no incrementales son un producto para todas las uñas:
// se fuerza quantity = 1 aunque venga otro valor.
export function addonQuantity(addon) {
  if (addon?.incremental === false) return 1
  const quantity = Number(addon?.quantity)
  return Number.isFinite(quantity) && quantity >= 1 ? Math.floor(quantity) : 1
}

export function addonUnitPrice(addon) {
  return Number(addon?.price) || 0
}

export function addonUnitDuration(addon) {
  return Number(addon?.duration) || 0
}

export function addonLinePrice(addon) {
  return addonUnitPrice(addon) * addonQuantity(addon)
}

export function addonLineDuration(addon) {
  return addonUnitDuration(addon) * addonQuantity(addon)
}

function resolveService(serviceMap, id) {
  if (!serviceMap || id == null) return null
  if (Array.isArray(serviceMap)) {
    return serviceMap.find((service) => service?.id === id) || null
  }
  return serviceMap[id] || null
}

function getAppointmentServiceIds(appointment) {
  return Array.isArray(appointment?.serviceIds) ? appointment.serviceIds : []
}

export function apptTotalDuration(appointment, serviceMap) {
  const serviceMinutes = getAppointmentServiceIds(appointment).reduce(
    (sum, id) => sum + (Number(resolveService(serviceMap, id)?.duration) || 0),
    0,
  )
  const addonMinutes = getAppointmentAddons(appointment).reduce(
    (sum, addon) => sum + addonLineDuration(addon),
    0,
  )
  return serviceMinutes + addonMinutes
}

export function apptTotalPrice(appointment, serviceMap) {
  const serviceIds = getAppointmentServiceIds(appointment)
  const servicesKnown = serviceIds.every(
    (id) => resolveService(serviceMap, id)?.price != null,
  )
  if (!servicesKnown) return null

  const servicePrice = serviceIds.reduce(
    (sum, id) => sum + (Number(resolveService(serviceMap, id)?.price) || 0),
    0,
  )
  const addonPrice = getAppointmentAddons(appointment).reduce(
    (sum, addon) => sum + addonLinePrice(addon),
    0,
  )
  return servicePrice + addonPrice
}

export function formatAddonNames(addons) {
  const list = Array.isArray(addons) ? addons.filter(Boolean) : []
  return list.map((addon) => {
    const quantity = addonQuantity(addon)
    return quantity > 1 ? `${addon.name} ×${quantity}` : addon.name
  })
}

export function apptAddonNames(appointment) {
  return formatAddonNames(getAppointmentAddons(appointment))
}

export function apptFullNames(appointment, serviceMap) {
  const serviceNames = getAppointmentServiceIds(appointment)
    .map((id) => resolveService(serviceMap, id)?.name)
    .filter(Boolean)
  return [...serviceNames, ...apptAddonNames(appointment)]
}

// Normaliza lo que se guarda en appointments.addons: valores unitarios + quantity.
export function sanitizeAppointmentAddons(addons) {
  return normalizeAddonList(addons).map((addon) => ({
    id: String(addon.id),
    serviceId: addon.serviceId != null ? String(addon.serviceId) : '',
    name: addon.name || '',
    icon: addon.icon || '',
    quantity: addonQuantity(addon),
    price: addonUnitPrice(addon),
    duration: addonUnitDuration(addon),
  }))
}

// Construye el adicional que se guarda en el estado del agendamiento.
export function makeAppointmentAddon(serviceId, addon) {
  const incremental = addon.incremental !== false
  const id =
    addon.id != null && addon.id !== ''
      ? String(addon.id)
      : String(addon.name || 'addon')
  return {
    id,
    serviceId: serviceId != null ? String(serviceId) : '',
    name: addon.name || '',
    icon: addon.icon || '',
    quantity: 1,
    price: addonUnitPrice(addon),
    duration: addonUnitDuration(addon),
    incremental,
  }
}

// Totales de la selección en curso (servicios elegidos + adicionales aceptados).
export function getSelectionTotals(services, addons) {
  const serviceList = Array.isArray(services) ? services.filter(Boolean) : []
  const addonList = Array.isArray(addons) ? addons.filter(Boolean) : []

  const duration =
    serviceList.reduce((sum, s) => sum + (Number(s.duration) || 0), 0) +
    addonList.reduce((sum, addon) => sum + addonLineDuration(addon), 0)

  const servicesPrice = serviceList.every((s) => s.price != null)
    ? serviceList.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
    : null

  const addonsPrice = addonList.reduce(
    (sum, addon) => sum + addonLinePrice(addon),
    0,
  )

  const price = servicesPrice != null ? servicesPrice + addonsPrice : null

  return { duration, price, servicesPrice, addonsPrice }
}
