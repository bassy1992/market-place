import { useEffect, useState } from 'react'

const NAV_LINKS = ['Buy a Car', 'Sell a Car', 'Dealers', 'About']

type Car = {
  id: number
  image: string
  make: string
  model: string
  year: number
  price: string
  mileage: string
  location: string
  dealer: string
  condition: string
  overview?: string
  fuel?: string
  transmission?: string
  engine?: string
  color?: string
}

type DealerInventoryItem = {
  id: number
  title: string
  price: string
  location: string
  status: string
}

type Dealer = {
  id?: number
  logo?: string
  name: string
  location: string
  cars: number
  verified: boolean
  initials: string
  color: string
  phone: string
  email: string
  rating: number
  response: string
  description: string
  specialties: string[]
  hours: string
  inventory: DealerInventoryItem[]
}

type LoginUser = {
  id: number
  username: string
  email: string
  name?: string
}

type CarVideo = {
  id: number
  video: string
  uploaded_at: string
}

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

async function readApiResponse(response: Response): Promise<{ detail?: string; token?: string; user?: LoginUser; id?: number; logo?: string; makes?: string[]; models?: string[] }> {
  const body = await response.text()
  if (!body) return {}

  try {
    return JSON.parse(body) as { detail?: string; token?: string; user?: LoginUser; id?: number; logo?: string; makes?: string[]; models?: string[] }
  } catch {
    return { detail: body }
  }
}

const FEATURED_CARS: Car[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1610099610040-ab19f3a5ec35?w=600&h=380&fit=crop&auto=format',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    price: 'GH₵ 285,000',
    mileage: '18,400 km',
    location: 'East Legon, Accra',
    dealer: 'Prestige Motors GH',
    condition: 'Foreign Used',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1624085568108-36410cfe4d24?w=600&h=380&fit=crop&auto=format',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2021,
    price: 'GH₵ 420,000',
    mileage: '32,000 km',
    location: 'Kumasi, Ashanti',
    dealer: 'Ashanti Auto Hub',
    condition: 'Foreign Used',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1585390062628-be8608aa7d83?w=600&h=380&fit=crop&auto=format',
    make: 'Lexus',
    model: 'RX 350',
    year: 2023,
    price: 'GH₵ 510,000',
    mileage: '9,200 km',
    location: 'Airport Hills, Accra',
    dealer: 'Capitol Auto Sales',
    condition: 'Brand New',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1744807063315-a7eee4b18c9c?w=600&h=380&fit=crop&auto=format',
    make: 'Kia',
    model: 'Sportage',
    year: 2022,
    price: 'GH₵ 195,000',
    mileage: '24,600 km',
    location: 'Takoradi, Western',
    dealer: 'Western Auto Centre',
    condition: 'Foreign Used',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1574023240744-64c47c8c0676?w=600&h=380&fit=crop&auto=format',
    make: 'BMW',
    model: 'X5',
    year: 2020,
    price: 'GH₵ 380,000',
    mileage: '41,000 km',
    location: 'Labone, Accra',
    dealer: 'Gold Coast Motors',
    condition: 'Foreign Used',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1574023278969-abb7ab49945c?w=600&h=380&fit=crop&auto=format',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    price: 'GH₵ 220,000',
    mileage: '5,800 km',
    location: 'Tamale, Northern',
    dealer: 'Northern Star Motors',
    condition: 'Brand New',
  },
]

const CAR_MAKES = [
  { name: 'Toyota', logo: 'https://cdn.simpleicons.org/toyota/EB0A1E', color: '#EB0A1E' },
  { name: 'Mercedes-Benz', logo: 'https://cdn.simpleicons.org/mercedes/FFFFFF', color: '#333' },
  { name: 'Honda', logo: 'https://cdn.simpleicons.org/honda/CC0000', color: '#CC0000' },
  { name: 'Hyundai', logo: 'https://cdn.simpleicons.org/hyundai/7B9BB7', color: '#002C5F' },
  { name: 'Kia', logo: 'https://cdn.simpleicons.org/kia/C21B17', color: '#C21B17' },
  { name: 'Nissan', logo: 'https://cdn.simpleicons.org/nissan/C3002F', color: '#C3002F' },
  { name: 'BMW', logo: 'https://cdn.simpleicons.org/bmw/0066B1', color: '#0066B1' },
  { name: 'Lexus', logo: 'https://cdn.simpleicons.org/lexus/FFFFFF', color: '#1A1A1A' },
  { name: 'Ford', logo: 'https://cdn.simpleicons.org/ford/003478', color: '#003476' },
  { name: 'Audi', logo: 'https://cdn.simpleicons.org/audi/BB0A30', color: '#BB0A30' },
]

const CAR_MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'Land Cruiser', 'Land Cruiser Prado', 'RAV4', 'Hilux', 'Vitz'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Fit'],
  Hyundai: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'i10'],
  Kia: ['Sportage', 'Sorento', 'Picanto', 'Seltos', 'K5'],
  Nissan: ['Altima', 'Sentra', 'X-Trail', 'Patrol', 'Navara'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X6'],
  Lexus: ['IS 300', 'ES 350', 'RX 350', 'GX 460', 'LX 600'],
  Ford: ['Ranger', 'Explorer', 'Escape', 'Edge', 'Everest'],
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  Acura: ['ILX', 'TLX', 'RDX', 'MDX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
  'Aston Martin': ['DB11', 'DB12', 'DBX', 'Vantage'],
  Bentley: ['Bentayga', 'Continental GT', 'Flying Spur'],
  Cadillac: ['CT4', 'CT5', 'XT4', 'XT5', 'Escalade'],
  Chevrolet: ['Malibu', 'Camaro', 'Tahoe', 'Suburban', 'Traverse'],
  Chrysler: ['300', 'Pacifica', 'Voyager'],
  Citroen: ['C3', 'C4', 'C5 Aircross'],
  Dacia: ['Duster', 'Sandero', 'Jogger'],
  Daewoo: ['Matiz', 'Nubira', 'Lacetti'],
  Dodge: ['Charger', 'Challenger', 'Durango', 'Ram'],
  Ferrari: ['Roma', '296 GTB', 'F8 Tributo', 'Purosangue'],
  Fiat: ['500', 'Panda', 'Tipo', 'Doblo'],
  Genesis: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  GMC: ['Terrain', 'Acadia', 'Yukon', 'Sierra'],
  'Great Wall': ['Cannon', 'Haval H6', 'Haval Jolion', 'Poer'],
  Infiniti: ['Q50', 'QX50', 'QX60', 'QX80'],
  Isuzu: ['D-Max', 'MU-X', 'Trooper'],
  Jaguar: ['XE', 'XF', 'F-Pace', 'F-Type'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Compass', 'Renegade', 'Gladiator'],
  Lamborghini: ['Urus', 'Huracan', 'Revuelto', 'Aventador'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender', 'Evoque'],
  Maserati: ['Ghibli', 'Levante', 'Grecale', 'Quattroporte'],
  Mazda: ['Mazda2', 'Mazda3', 'CX-5', 'CX-30', 'CX-9'],
  McLaren: ['570S', '720S', 'Artura', 'GT'],
  Mini: ['Cooper', 'Countryman', 'Clubman', 'Convertible'],
  Mitsubishi: ['Outlander', 'Pajero', 'Triton', 'ASX'],
  Opel: ['Corsa', 'Astra', 'Mokka', 'Grandland'],
  Peugeot: ['208', '308', '3008', '5008', 'Landtrek'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  Renault: ['Clio', 'Megane', 'Duster', 'Koleos', 'Captur'],
  'Rolls-Royce': ['Ghost', 'Phantom', 'Cullinan', 'Spectre'],
  Saab: ['9-3', '9-5'],
  Seat: ['Ibiza', 'Leon', 'Arona', 'Ateca'],
  Skoda: ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq'],
  Smart: ['Fortwo', 'Forfour'],
  Subaru: ['Impreza', 'Forester', 'Outback', 'Crosstrek', 'WRX'],
  Suzuki: ['Swift', 'Vitara', 'Jimny', 'Ertiga', 'Ciaz'],
  Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
  Volvo: ['S60', 'S90', 'XC40', 'XC60', 'XC90'],
  Volkswagen: ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Touareg'],
  Wuling: ['Hongguang', 'Almaz', 'Air EV'],
  BYD: ['Atto 3', 'Dolphin', 'Seal', 'Han', 'Tang', 'Song Plus', 'Yuan Plus', 'Seagull', 'Shark'],
  Changan: ['Alsvin', 'CS35 Plus', 'CS55 Plus', 'CS75 Plus', 'CS95', 'UNI-T', 'UNI-K', 'Hunter'],
  Chery: ['Tiggo 2', 'Tiggo 4', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 5', 'Arrizo 8'],
  Dongfeng: ['Aeolus S50', 'Aeolus AX7', 'Forthing T5', 'Forthing T7', 'Rich 6'],
  FAW: ['Bestune B70', 'Bestune T55', 'Bestune T77', 'Bestune T99', 'Hongqi H5', 'Hongqi HS5'],
  Foton: ['Tunland', 'View', 'Toano', 'Sauvana'],
  GAC: ['GS3', 'GS4', 'GS5', 'GS8', 'Emkoo', 'Aion Y', 'Aion S'],
  Geely: ['Emgrand', 'Coolray', 'Azkarra', 'Monjaro', 'Geometry C', 'Okavango'],
  Haval: ['H2', 'H6', 'H6 Hybrid', 'H9', 'Jolion', 'Dargo'],
  JAC: ['S2', 'S3', 'S4', 'JS6', 'T6', 'T8'],
  Jetour: ['X70', 'X70 Plus', 'X90', 'Dashing', 'Traveller'],
  JMC: ['Vigus', 'Grand Avenue', 'Baodian', 'Carryall'],
  'Li Auto': ['Li L6', 'Li L7', 'Li L8', 'Li L9', 'Mega'],
  Leapmotor: ['T03', 'C01', 'C10', 'C11', 'C16'],
  'Lynk & Co': ['01', '02', '03', '05', '06', '09'],
  Maxus: ['D60', 'D90', 'G10', 'G50', 'T60', 'T90'],
  NIO: ['ET5', 'ET7', 'EL6', 'EL7', 'EL8', 'ES6', 'ES8'],
  OMODA: ['C5', 'C7', 'E5'],
  Ora: ['Good Cat', 'Funky Cat', 'Lightning Cat'],
  Roewe: ['i5', 'i6', 'RX5', 'RX8', 'Marvel R'],
  SAIC: ['MG3', 'MG4', 'MG5', 'MG6', 'MG ZS', 'MG HS'],
  Seres: ['3', '5', '7', 'SF5'],
  Skywell: ['ET5', 'HT-i'],
  Soueast: ['DX3', 'DX5', 'DX7'],
  Tank: ['300', '500', '700'],
  Voyah: ['Free', 'Dreamer', 'Passion'],
  Xpeng: ['P5', 'P7', 'G3', 'G6', 'G9', 'X9'],
  Zeekr: ['001', '007', '009', 'X', '7X'],
  Zotye: ['T300', 'T600', 'SR7', 'Z100'],
}

const CAR_MAKE_OPTIONS = Object.keys(CAR_MODELS)

const BODY_TYPES = [
  { name: 'SUV', icon: 'suv', count: '2,840' },
  { name: 'Sedan', icon: 'sedan', count: '1,920' },
  { name: 'Pickup', icon: 'pickup', count: '640' },
  { name: 'Coupe', icon: 'coupe', count: '380' },
  { name: 'Hatchback', icon: 'hatchback', count: '760' },
  { name: 'Van', icon: 'van', count: '290' },
]

const DEALERS: Dealer[] = [
  {
    name: 'Prestige Motors Ghana',
    location: 'East Legon, Accra',
    cars: 142,
    verified: true,
    initials: 'PM',
    color: '#c9a84c',
    phone: '+233 24 123 4567',
    email: 'sales@prestigemotorsgh.com',
    rating: 4.9,
    response: 'Under 1 hour',
    description:
      'Prestige Motors Ghana is a trusted premium dealership serving Accra families and executives looking for high-quality vehicles with polished service and transparent pricing.',
    specialties: ['Luxury sedans', 'Family SUVs', 'Certified pre-owned'],
    hours: 'Mon - Sat · 8:00 AM - 7:00 PM',
    inventory: [
      { id: 101, title: '2022 Mercedes-Benz C-Class', price: 'GH₵ 285,000', location: 'East Legon, Accra', status: 'Foreign Used' },
      { id: 102, title: '2021 BMW 3 Series', price: 'GH₵ 310,000', location: 'East Legon, Accra', status: 'Foreign Used' },
      { id: 103, title: '2023 Lexus IS 300', price: 'GH₵ 340,000', location: 'East Legon, Accra', status: 'Brand New' },
    ],
  },
  {
    name: 'Ashanti Auto Hub',
    location: 'Ahodwo, Kumasi',
    cars: 98,
    verified: true,
    initials: 'AA',
    color: '#0d1b2a',
    phone: '+233 20 555 2244',
    email: 'hello@ashantiautohub.com',
    rating: 4.8,
    response: 'Within 2 hours',
    description:
      'Ashanti Auto Hub is known for practical, dependable vehicles and honest advice for buyers across Kumasi and the Ashanti Region.',
    specialties: ['Pickup trucks', 'Family SUVs', 'Commercial vehicles'],
    hours: 'Mon - Sat · 7:30 AM - 6:30 PM',
    inventory: [
      { id: 201, title: '2021 Toyota Land Cruiser Prado', price: 'GH₵ 420,000', location: 'Kumasi, Ashanti', status: 'Foreign Used' },
      { id: 202, title: '2020 Ford Ranger Wildtrak', price: 'GH₵ 265,000', location: 'Kumasi, Ashanti', status: 'Foreign Used' },
      { id: 203, title: '2023 Hyundai Tucson', price: 'GH₵ 235,000', location: 'Kumasi, Ashanti', status: 'Brand New' },
    ],
  },
  {
    name: 'Capitol Auto Sales',
    location: 'Airport Hills, Accra',
    cars: 215,
    verified: true,
    initials: 'CA',
    color: '#1e3a5f',
    phone: '+233 26 988 7733',
    email: 'info@capitolautosalesgh.com',
    rating: 5.0,
    response: 'Usually in under 30 minutes',
    description:
      'Capitol Auto Sales carries a broad selection of premium and everyday vehicles for busy city drivers and growing families in Accra.',
    specialties: ['Luxury crossovers', 'Hybrid cars', 'Executive sedans'],
    hours: 'Mon - Sun · 9:00 AM - 8:00 PM',
    inventory: [
      { id: 301, title: '2023 Lexus RX 350', price: 'GH₵ 510,000', location: 'Airport Hills, Accra', status: 'Brand New' },
      { id: 302, title: '2022 Audi Q5', price: 'GH₵ 470,000', location: 'Airport Hills, Accra', status: 'Foreign Used' },
      { id: 303, title: '2021 Volvo XC60', price: 'GH₵ 455,000', location: 'Airport Hills, Accra', status: 'Foreign Used' },
    ],
  },
  {
    name: 'Gold Coast Motors',
    location: 'Labone, Accra',
    cars: 77,
    verified: false,
    initials: 'GC',
    color: '#8b5e0a',
    phone: '+233 27 776 1122',
    email: 'cars@goldcoastmotorsgh.com',
    rating: 4.6,
    response: 'Within 4 hours',
    description:
      'Gold Coast Motors offers accessible vehicles for buyers seeking dependable options at competitive prices with a friendly local approach.',
    specialties: ['Budget cars', 'Used hatchbacks', 'Entry-level SUVs'],
    hours: 'Mon - Sat · 8:30 AM - 6:00 PM',
    inventory: [
      { id: 401, title: '2020 BMW X5', price: 'GH₵ 380,000', location: 'Labone, Accra', status: 'Foreign Used' },
      { id: 402, title: '2022 Kia Sportage', price: 'GH₵ 195,000', location: 'Labone, Accra', status: 'Foreign Used' },
      { id: 403, title: '2021 Toyota Corolla', price: 'GH₵ 170,000', location: 'Labone, Accra', status: 'Ghana Used' },
    ],
  },
]

const DEALER_FALLBACK_IMAGES: Record<string, string> = {
  'Prestige Motors Ghana': 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=240&h=240&fit=crop&auto=format',
  'Ashanti Auto Hub': 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=240&h=240&fit=crop&auto=format',
  'Capitol Auto Sales': 'https://images.unsplash.com/photo-1562519819-016930ada31b?w=240&h=240&fit=crop&auto=format',
  'Gold Coast Motors': 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=240&h=240&fit=crop&auto=format',
}

function dealerImage(dealer: Dealer) {
  return dealer.logo || DEALER_FALLBACK_IMAGES[dealer.name] || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=240&h=240&fit=crop&auto=format'
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth={2} className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="#c9a84c" className="w-3.5 h-3.5">
      <path d="M8 1l1.85 3.75L14 5.4l-3 2.93.71 4.13L8 10.35l-3.71 1.95.71-4.13L2 5.4l4.15-.65z" />
    </svg>
  )
}

function BodyTypeIcon({ type }: { type: string }) {
  const paths = {
    suv: 'M3 13.5 5.1 7h9.8l3.1 3.2H21v4.3M3 13.5h18M6.2 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.8 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM5.1 7l1.2-2h7.6l1 2',
    sedan: 'M3 13.5 5.6 8h8.8l3.7 3.1H21v3.4M3 13.5h18M6.4 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.6 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM5.6 8l2-3h6.1l.7 3',
    pickup: 'M3 13.5V8h10l3 3h5v3.5M3 13.5h18M6.2 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.8 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM13 8v3h3',
    coupe: 'M3 13.5 6 8h8l4 3h3v3.5M3 13.5h18M6.2 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.8 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM6 8l3-3h4l1 3',
    hatchback: 'M3 13.5 5 8h9l4 3h3v3.5M3 13.5h18M6.2 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.8 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM5 8l2.5-3h6l.5 3',
    van: 'M3 13.5V6h13l4 4v3.5M3 13.5h18M6.2 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.8 16.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM7 6v5h9',
  } as const

  return (
    <svg viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-16" aria-hidden="true">
      <path d={paths[type as keyof typeof paths] ?? paths.sedan} />
    </svg>
  )
}

function ProductDetailPage({ car, dealers, onBack }: { car: Car; dealers: Dealer[]; onBack: () => void }) {
  const [savedVideoUrl, setSavedVideoUrl] = useState('')
  const dealer = dealers.find(item => item.name === car.dealer)
  const dealerPhone = dealer?.phone || '+233302921100'
  const dealerEmail = dealer?.email || 'hello@autoghana.com.gh'

  useEffect(() => {
    const loadSavedVideo = async () => {
      try {
        const response = await fetch(`${API_URL}/cars/${car.id}/videos/`)
        const videos = (await response.json()) as CarVideo[]
        if (response.ok && videos[0]) setSavedVideoUrl(videos[0].video)
      } catch {
      }
    }
    void loadSavedVideo()
  }, [car.id])


  const galleryImages = [
    car.image,
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=900&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=900&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&h=900&fit=crop&auto=format',
  ]

  const specList = [
    { label: 'Year', value: String(car.year) },
    { label: 'Mileage', value: car.mileage },
    { label: 'Fuel', value: car.fuel || 'Not specified' },
    { label: 'Transmission', value: car.transmission || 'Not specified' },
    { label: 'Engine', value: car.engine || 'Not specified' },
    { label: 'Color', value: car.color || 'Not specified' },
    { label: 'Condition', value: car.condition },
    { label: 'Location', value: car.location },
  ]

  return (
    <div className="min-h-screen page-shell" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 hover:text-white transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to listings
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#0d1b2a" strokeWidth="2.5">
                  <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                Auto<span style={{ color: '#c9a84c' }}>Ghana</span>
              </span>
            </div>

            <a href={`tel:${dealerPhone}`} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
              Contact Dealer
            </a>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 section-reveal">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6b7280' }}>
            <span>Home</span>
            <span>•</span>
            <span>Cars</span>
            <span>•</span>
            <span className="font-medium" style={{ color: '#0d1b2a' }}>{car.make}</span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
              <div className="overflow-hidden rounded-[28px] border bg-white shadow-sm" style={{ borderColor: '#e5e0d8' }}>
                <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} className="h-[420px] w-full object-cover lg:h-[600px]" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {galleryImages.map((image, idx) => (
                  <button
                    key={`${image}-${idx}`}
                    className="overflow-hidden rounded-2xl border transition-all hover:scale-[1.01]"
                    style={{ borderColor: idx === 0 ? '#c9a84c' : '#e5e0d8', boxShadow: idx === 0 ? '0 0 0 1px rgba(201,168,76,0.25)' : 'none' }}
                  >
                    <img src={image} alt={`${car.make} view ${idx + 1}`} className="h-24 w-full object-cover sm:h-28" />
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: '#edf7ef', color: '#006B3F' }}>
                {car.condition}
              </div>

              <h1 className="mt-4 font-display text-4xl leading-none text-slate-900">
                {car.year} {car.make} {car.model}
              </h1>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, idx) => <StarIcon key={idx} />)}</div>
                <span className="text-sm font-medium" style={{ color: '#6b7280' }}>4.9 · 128 reviews</span>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <span className="font-display text-5xl font-bold leading-none" style={{ color: '#c9a84c' }}>{car.price}</span>
                <span className="pb-2 text-sm text-slate-500">Negotiable</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-3" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Mileage</div>
                  <div className="mt-1 font-semibold text-slate-900">{car.mileage}</div>
                </div>
                <div className="rounded-2xl p-3" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Transmission</div>
                  <div className="mt-1 font-semibold text-slate-900">{car.transmission || 'Not specified'}</div>
                </div>
                <div className="rounded-2xl p-3" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Fuel</div>
                  <div className="mt-1 font-semibold text-slate-900">{car.fuel || 'Not specified'}</div>
                </div>
                <div className="rounded-2xl p-3" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Color</div>
                  <div className="mt-1 font-semibold text-slate-900">{car.color || 'Not specified'}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                  <button className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-95" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)' }}>
                  Book a Test Drive
                </button>
                <a href={`mailto:${dealerEmail}?subject=${encodeURIComponent(`Inquiry about ${car.year} ${car.make} ${car.model}`)}`} className="block w-full rounded-xl px-5 py-3.5 text-center text-sm font-semibold transition-all hover:opacity-95" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
                  Message Seller
                </a>
              </div>

              <div className="mt-6 rounded-2xl p-4" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: '#0d1b2a' }}>
                      {car.dealer.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{car.dealer}</div>
                      <div className="text-sm" style={{ color: '#6b7280' }}>{car.location}</div>
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#e8f5ee', color: '#006B3F' }}>
                    Verified
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm" style={{ color: '#6b7280' }}>
                  <span>Response time: under 1 hour</span>
                  <span>4.9 rating</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 section-reveal">
          <div className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Dealer media</span>
                </div>
                <h2 className="font-display text-3xl text-slate-900">Show the car in motion</h2>
                <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>Upload a short walkaround or test-drive video for buyers.</p>
              </div>

            </div>

            {savedVideoUrl ? (
              <div className="mt-5 overflow-hidden rounded-2xl bg-slate-950">
                <video src={savedVideoUrl} controls className="max-h-[520px] w-full" aria-label={`${car.make} ${car.model} dealer video`} />
              </div>
            ) : (
              <label className="mt-5 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors hover:border-[#c9a84c] hover:bg-[#fffdf7]" style={{ borderColor: '#e5e0d8' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10" style={{ color: '#c9a84c' }}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m10 12 2-2 4 4M8 16l2-2" />
                  <circle cx="8" cy="9" r="1" />
                </svg>
                <span className="mt-3 text-sm font-semibold text-slate-900">No dealer video yet</span>
                <span className="mt-1 text-xs" style={{ color: '#6b7280' }}>The dealer can add a walkaround video from their dashboard.</span>
              </label>
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
              <h2 className="font-display text-3xl text-slate-900">Vehicle Overview</h2>
              <p className="mt-4 text-base leading-7" style={{ color: '#4b5563' }}>
                {car.overview || `This ${car.year} ${car.make} ${car.model} combines performance, comfort and value in an unmistakably premium package. It has been carefully maintained, features a clean interior and a modern, road-ready finish that suits both city driving and long-distance travel across Ghana.`}
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
              <h2 className="font-display text-3xl text-slate-900">Specifications</h2>
              <div className="mt-5 space-y-3">
                {specList.map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: '#f0ede8' }}>
                    <span className="text-sm font-medium" style={{ color: '#6b7280' }}>{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>More options</span>
              </div>
              <h2 className="font-display text-4xl text-slate-900">Similar listings</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_CARS.filter(item => item.id !== car.id).slice(0, 3).map(item => (
              <div key={item.id} className="overflow-hidden rounded-[24px] border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ borderColor: '#edebe7' }}>
                <img src={item.image} alt={`${item.year} ${item.make} ${item.model}`} className="h-52 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.year} {item.make} {item.model}</h3>
                      <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>{item.location}</p>
                    </div>
                    <span className="font-display text-xl font-bold" style={{ color: '#c9a84c' }}>{item.price}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: '#f0ede8' }}>
                    <span className="text-sm" style={{ color: '#6b7280' }}>{item.mileage}</span>
                    <button onClick={onBack} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: '#0d1b2a' }}>
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ background: '#080f1a', color: '#d1d5db' }}>
        <div className="flex h-1">
          <div className="flex-1" style={{ background: '#006B3F' }} />
          <div className="flex-1" style={{ background: '#FCD116' }} />
          <div className="flex-1" style={{ background: '#CE1126' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#0d1b2a" strokeWidth="2.5">
                  <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
            </div>
            <div className="text-sm text-gray-400">© 2026 AutoGhana Ltd. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DealerDirectoryPage({ dealers, onBack, onSelect }: { dealers: Dealer[]; onBack: () => void; onSelect: (dealer: Dealer) => void }) {
  const [query, setQuery] = useState('')
  const visibleDealers = dealers.filter(dealer => `${dealer.name} ${dealer.location}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed left-0 right-0 top-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 transition hover:text-white">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Marketplace
          </button>
          <span className="font-display text-xl font-bold tracking-tight text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
          <div className="w-24" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Trusted partners</div>
            <h1 className="mt-2 font-display text-5xl text-slate-900">All dealers</h1>
            <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: '#6b7280' }}>Explore verified and independent dealers across Ghana, then browse their current inventory.</p>
          </div>
          <div className="rounded-2xl border bg-white px-5 py-3 text-sm" style={{ borderColor: '#e5e0d8' }}><strong className="text-slate-900">{dealers.length}</strong> dealers available</div>
        </div>

        <div className="mb-8 max-w-xl">
          <label htmlFor="dealer-search" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Find a dealer</label>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#9ca3af' }}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input id="dealer-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by dealer or location" className="w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleDealers.map(dealer => (
            <article key={dealer.name} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: '#e5e0d8' }}>
              <div className="flex items-start justify-between gap-4">
                <img src={dealerImage(dealer)} alt={`${dealer.name} profile`} className="h-20 w-20 rounded-2xl object-cover" />
                {dealer.verified && <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#edf7ef', color: '#006B3F' }}>Verified</span>}
              </div>
              <h2 className="mt-5 font-display text-2xl text-slate-900">{dealer.name}</h2>
              <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}><span>📍</span>{dealer.location}</div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}><div className="text-[10px] uppercase tracking-wider" style={{ color: '#6b7280' }}>Listings</div><div className="mt-1 font-bold text-slate-900">{dealer.cars}</div></div>
                <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}><div className="text-[10px] uppercase tracking-wider" style={{ color: '#6b7280' }}>Rating</div><div className="mt-1 font-bold text-slate-900">{dealer.rating.toFixed(1)} ★</div></div>
              </div>
              <button onClick={() => onSelect(dealer)} className="mt-5 w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#0d1b2a' }}>View inventory</button>
            </article>
          ))}
        </div>
        {!visibleDealers.length && <div className="rounded-2xl border border-dashed p-10 text-center text-sm" style={{ borderColor: '#d8d0c4', color: '#6b7280' }}>No dealers match your search.</div>}
      </main>
    </div>
  )
}

function ListingsPage({ cars, dealers, onBack, onViewCar }: { cars: Car[]; dealers: Dealer[]; onBack: () => void; onViewCar: (car: Car) => void }) {
  const [query, setQuery] = useState('')
  const [make, setMake] = useState('')
  const [dealer, setDealer] = useState('')
  const [condition, setCondition] = useState('')
  const [price, setPrice] = useState('')
  const visibleCars = cars.filter(car => {
    const matchesQuery = !query || `${car.make} ${car.model} ${car.location}`.toLowerCase().includes(query.toLowerCase())
    const matchesMake = !make || car.make === make
    const matchesDealer = !dealer || car.dealer === dealer
    const matchesCondition = !condition || car.condition === condition
    const amount = Number(car.price.replace(/[^0-9]/g, ''))
    const matchesPrice = !price || (price === 'under' && amount < 200000) || (price === 'mid' && amount >= 200000 && amount <= 400000) || (price === 'over' && amount > 400000)
    return matchesQuery && matchesMake && matchesDealer && matchesCondition && matchesPrice
  })

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed left-0 right-0 top-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 transition hover:text-white"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>Marketplace</button>
          <span className="font-display text-xl font-bold tracking-tight text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
          <div className="w-24" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>The marketplace</div>
          <h1 className="mt-2 font-display text-5xl text-slate-900">All listings</h1>
          <p className="mt-3 text-sm" style={{ color: '#6b7280' }}>Browse cars from trusted dealers and sellers across Ghana.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]" style={{ borderColor: '#e5e0d8' }}>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search make, model, or location" className="rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
          <select value={make} onChange={event => setMake(event.target.value)} className="rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option value="">All makes</option>{CAR_MAKE_OPTIONS.map(item => <option key={item}>{item}</option>)}</select>
          <select value={dealer} onChange={event => setDealer(event.target.value)} className="rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option value="">All dealers</option>{dealers.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</select>
          <select value={condition} onChange={event => setCondition(event.target.value)} className="rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option value="">Any condition</option><option>Brand New</option><option>Foreign Used</option><option>Ghana Used</option></select>
          <select value={price} onChange={event => setPrice(event.target.value)} className="rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option value="">Any price</option><option value="under">Under GH₵ 200,000</option><option value="mid">GH₵ 200,000 - 400,000</option><option value="over">Over GH₵ 400,000</option></select>
        </div>

        <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-3xl text-slate-900">Available cars</h2><span className="text-sm" style={{ color: '#6b7280' }}>{visibleCars.length} listings</span></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCars.map(car => (
            <article key={car.id} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: '#e5e0d8' }}>
              <div className="relative overflow-hidden"><img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: car.condition === 'Brand New' ? '#006B3F' : '#1e3a5f', color: '#fff' }}>{car.condition}</span></div>
              <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{car.year} {car.make} {car.model}</h3><p className="mt-1 text-xs" style={{ color: '#6b7280' }}>{car.mileage} · {car.location}</p></div><span className="font-display text-xl font-bold" style={{ color: '#c9a84c' }}>{car.price}</span></div><p className="mt-4 text-xs" style={{ color: '#6b7280' }}>Listed by {car.dealer}</p><button onClick={() => onViewCar(car)} className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white" style={{ background: '#0d1b2a' }}>View details</button></div>
            </article>
          ))}
        </div>
        {!visibleCars.length && <div className="rounded-2xl border border-dashed p-10 text-center text-sm" style={{ borderColor: '#d8d0c4', color: '#6b7280' }}>No listings match your filters.</div>}
      </main>
    </div>
  )
}

function DealerDetailPage({ dealer, cars, onBack, onViewCar }: { dealer: Dealer; cars: Car[]; onBack: () => void; onViewCar: (car: Car) => void }) {
  const liveInventory = cars.filter(car => car.dealer === dealer.name)
  const inventory = liveInventory.length
    ? liveInventory.map(car => ({ ...car, title: `${car.year} ${car.make} ${car.model}`, status: car.condition }))
    : dealer.inventory
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 hover:text-white transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to dealers
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#0d1b2a" strokeWidth="2.5">
                  <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                Auto<span style={{ color: '#c9a84c' }}>Ghana</span>
              </span>
            </div>

            <a href={`tel:${dealer.phone}`} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
              Call Dealer
            </a>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 section-reveal">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6b7280' }}>
            <span>Home</span>
            <span>•</span>
            <span>Dealers</span>
            <span>•</span>
            <span className="font-medium" style={{ color: '#0d1b2a' }}>{dealer.name}</span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
              <div className="flex items-center gap-4">
                <img src={dealerImage(dealer)} alt={`${dealer.name} profile`} className="h-28 w-28 rounded-2xl object-cover" />
                <div>
                  <h1 className="font-display text-4xl leading-tight text-slate-900">{dealer.name}</h1>
                  {dealer.verified && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: '#edf7ef', color: '#006B3F' }}>
                      <svg viewBox="0 0 12 12" fill="#006B3F" className="w-3 h-3">
                        <path d="M10 3L5 8.5 2 5.5" stroke="#006B3F" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                      </svg>
                      Verified dealer
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Cars</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{dealer.cars}</div>
                </div>
                <div className="rounded-2xl p-3" style={{ background: '#f8f7f4', border: '1px solid #f0ede8' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Rating</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{dealer.rating.toFixed(1)}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm" style={{ color: '#4b5563' }}>
                <div className="flex items-center gap-3">
                  <span>📍</span>
                  <span>{dealer.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>📞</span>
                  <span>{dealer.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>✉️</span>
                  <span>{dealer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>🕒</span>
                  <span>{dealer.hours}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a href={`tel:${dealer.phone}`} className="block w-full rounded-xl px-5 py-3.5 text-center text-sm font-semibold text-white transition-all hover:opacity-95" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)' }}>
                  Request a Callback
                </a>
                <a href={`mailto:${dealer.email}?subject=${encodeURIComponent(`Inquiry for ${dealer.name}`)}`} className="block w-full rounded-xl px-5 py-3.5 text-center text-sm font-semibold transition-all hover:opacity-95" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
                  Email Dealer
                </a>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
                <h2 className="font-display text-3xl text-slate-900">About the dealer</h2>
                <p className="mt-4 text-base leading-7" style={{ color: '#4b5563' }}>
                  {dealer.description}
                </p>

                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Specialties</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dealer.specialties.map(specialty => (
                      <span key={specialty} className="rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: '#f0ede8', color: '#0d1b2a' }}>
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border bg-white p-6 shadow-sm card-hover-lift" style={{ borderColor: '#e5e0d8' }}>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-3xl text-slate-900">Available inventory</h2>
                  <span className="text-sm font-medium" style={{ color: '#6b7280' }}>{inventory.length} listings</span>
                </div>

                <div className="mt-6 space-y-4">
                  {inventory.map(item => (
                    <div key={item.id} className="rounded-2xl border p-4" style={{ borderColor: '#f0ede8', background: '#f8f7f4' }}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                          <div className="mt-1 text-sm" style={{ color: '#6b7280' }}>{item.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl font-bold" style={{ color: '#c9a84c' }}>{item.price}</div>
                          <div className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#edf7ef', color: '#006B3F' }}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                      {cars.some(car => car.id === item.id) && <button onClick={() => { const liveCar = cars.find(car => car.id === item.id); if (liveCar) onViewCar(liveCar) }} className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: '#0d1b2a' }}>View vehicle details</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: '#080f1a', color: '#d1d5db' }}>
        <div className="flex h-1">
          <div className="flex-1" style={{ background: '#006B3F' }} />
          <div className="flex-1" style={{ background: '#FCD116' }} />
          <div className="flex-1" style={{ background: '#CE1126' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#0d1b2a" strokeWidth="2.5">
                  <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
            </div>
            <div className="text-sm text-gray-400">© 2026 AutoGhana Ltd. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function RegisterPage({ onBack, onLogin, onExistingAccount }: { onBack: () => void; onLogin: (user: LoginUser) => void; onExistingAccount: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.detail ?? 'Unable to create your account.')
      if (!data.token || !data.user) throw new Error('The server returned an incomplete account response.')
      localStorage.setItem('autoghana_token', data.token)
      onLogin(data.user)
    } catch (error) {
      setMessage(error instanceof TypeError ? 'The backend is unavailable. Start Django on port 8000 and try again.' : error instanceof Error ? error.message : 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 transition-colors hover:text-white">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to marketplace
          </button>
          <span className="font-display text-xl font-bold tracking-tight text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
          <div className="w-32" aria-hidden="true" />
        </div>
      </header>

      <main className="relative flex min-h-screen items-center justify-center px-4 pb-12 pt-28 sm:px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,27,42,0.04), rgba(201,168,76,0.12))' }} />
        <div className="relative w-full max-w-xl rounded-[28px] border bg-white p-7 shadow-xl sm:p-10 lg:p-12" style={{ borderColor: '#e5e0d8' }}>
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Join AutoGhana</div>
            <h1 className="mt-3 font-display text-4xl text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>Save cars, connect with dealers, and list your vehicle.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="register-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Full name</label>
              <input id="register-name" type="text" value={name} onChange={event => setName(event.target.value)} required autoComplete="name" placeholder="Your full name" className="w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
            </div>
            <div>
              <label htmlFor="register-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Email address</label>
              <input id="register-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
            </div>
            <div>
              <label htmlFor="register-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Password</label>
              <input id="register-password" type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className="w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
            </div>
            <div>
              <label htmlFor="register-confirm-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Confirm password</label>
              <input id="register-confirm-password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Repeat your password" className="w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl py-4 text-sm font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)', color: '#ffffff' }}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
            {message && <p role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ background: '#fff1f0', color: '#a33a32' }}>{message}</p>}
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: '#6b7280' }}>Already have an account? <button type="button" onClick={onExistingAccount} className="font-semibold" style={{ color: '#c9a84c' }}>Sign in</button></p>
        </div>
      </main>
    </div>
  )
}

function LoginPage({ onBack, onLogin, onCreateAccount }: { onBack: () => void; onLogin: (user: LoginUser) => void; onCreateAccount: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await readApiResponse(response)

      if (!response.ok) throw new Error(data.detail ?? 'Unable to sign in.')
      if (!data.token || !data.user) throw new Error('The server returned an incomplete login response.')

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('autoghana_token', data.token)
      onLogin(data.user)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 transition-colors hover:text-white">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to marketplace
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="#0d1b2a" strokeWidth="2.5">
                <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
          </div>
          <div className="w-32" aria-hidden="true" />
        </div>
      </header>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-28 sm:px-6">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,27,42,0.04), rgba(201,168,76,0.12))' }} />
        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]" style={{ borderColor: '#e5e0d8' }}>
          <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
            <img src="https://images.unsplash.com/photo-1611147533125-9ca445f32036?w=1000&h=1200&fit=crop&auto=format" alt="Car driving at night" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(13,27,42,0.96), rgba(13,27,42,0.56))' }} />
            <div className="relative flex h-full flex-col justify-end p-10 text-white">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px w-8" style={{ background: '#c9a84c' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Welcome back</span>
              </div>
              <h1 className="font-display text-5xl leading-tight">Your next drive starts here.</h1>
              <p className="mt-4 max-w-sm leading-relaxed text-gray-300">Save your favorite cars, contact trusted dealers, and manage your listings in one place.</p>
            </div>
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <div className="mb-8">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Account access</div>
              <h2 className="mt-3 font-display text-4xl text-slate-900">Sign in to AutoGhana</h2>
              <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>Use your account details to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Email address</label>
                <input id="login-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Password</label>
                  <button type="button" className="text-xs font-semibold" style={{ color: '#c9a84c' }}>Forgot password?</button>
                </div>
                <input id="login-password" type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={6} autoComplete="current-password" placeholder="Enter your password" className="w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
              </div>
              <label className="flex items-center gap-2.5 text-sm" style={{ color: '#6b7280' }}>
                <input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} className="h-4 w-4 accent-[#c9a84c]" />
                Remember me
              </label>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl py-4 text-sm font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)', color: '#ffffff' }}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
              {message && <p role="status" className="rounded-xl px-4 py-3 text-sm" style={{ background: '#fff8e6', color: '#80651a' }}>{message}</p>}
            </form>

            <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-widest" style={{ color: '#9ca3af' }}>
              <div className="h-px flex-1" style={{ background: '#e5e0d8' }} />
              <span>New here?</span>
              <div className="h-px flex-1" style={{ background: '#e5e0d8' }} />
            </div>
            <button type="button" onClick={onCreateAccount} className="w-full rounded-xl border py-3.5 text-sm font-semibold transition hover:bg-[#f8f7f4]" style={{ borderColor: '#0d1b2a', color: '#0d1b2a' }}>Create an account</button>
          </div>
        </div>
      </main>
    </div>
  )
}

function DealerDashboardPage({ user, cars, onBack, onLogout, onViewCar, onCarPosted, onDealerUpdated }: { user: LoginUser; cars: Car[]; onBack: () => void; onLogout: () => void; onViewCar: (car: Car) => void; onCarPosted: (car: Car) => void; onDealerUpdated: (dealer: Dealer) => void }) {
  const [form, setForm] = useState({ make: '', model: '', year: '', price: '', mileage: '', location: '', condition: 'Foreign Used', overview: '', fuel: 'Petrol', transmission: 'Automatic', engine: '', color: '' })
  const [availableMakes, setAvailableMakes] = useState(CAR_MAKE_OPTIONS)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoMessage, setLogoMessage] = useState('')
  const [uploadingVideoId, setUploadingVideoId] = useState<number | null>(null)
  const [videoMessages, setVideoMessages] = useState<Record<number, string>>({})
  const [videoUploadCarId, setVideoUploadCarId] = useState<number | ''>('')
  const [dealerForm, setDealerForm] = useState({ name: user.name || user.username, location: '', phone: '', email: user.email, hours: '', description: '', specialties: '' })
  const [dealerMessage, setDealerMessage] = useState('')
  const token = localStorage.getItem('autoghana_token') ?? sessionStorage.getItem('autoghana_token')
  const ownedCars = cars.filter(car => car.dealer === user.name || car.dealer === user.username || car.dealer === user.email)
  const videoUploadCar = ownedCars.find(car => car.id === videoUploadCarId) ?? ownedCars[0]

  useEffect(() => {
    const loadMakes = async () => {
      try {
        const response = await fetch(`${API_URL}/vehicle-options/`)
        const data = await readApiResponse(response)
        if (response.ok && data.makes?.length) {
          setAvailableMakes([...new Set([...CAR_MAKE_OPTIONS, ...data.makes])].sort())
        }
      } catch {
      }
    }
    void loadMakes()
  }, [])

  useEffect(() => {
    if (!form.make) {
      setAvailableModels([])
      return
    }

    const loadModels = async () => {
      setAvailableModels(CAR_MODELS[form.make] ?? [])
      try {
        const response = await fetch(`${API_URL}/vehicle-options/?make=${encodeURIComponent(form.make)}`)
        const data = await readApiResponse(response)
        if (response.ok && data.models?.length) setAvailableModels(data.models)
      } catch {
      }
    }
    void loadModels()
  }, [form.make])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return
    }

    const preview = URL.createObjectURL(imageFile)
    setImagePreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [imageFile])

  useEffect(() => {
    if (!logoFile) return
    const preview = URL.createObjectURL(logoFile)
    setLogoPreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [logoFile])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/dealers/profile/`, { headers: { Authorization: `Token ${token ?? ''}` } })
        const data = await readApiResponse(response) as Dealer
        if (response.ok) setDealerForm({ name: data.name, location: data.location, phone: data.phone, email: data.email, hours: data.hours, description: data.description, specialties: data.specialties.join(', ') })
      } catch {
      }
    }
    void loadProfile()
  }, [])

  const uploadLogo = async () => {
    if (!logoFile) return
    setLogoMessage('')
    const profileData = new FormData()
    profileData.append('logo', logoFile)
    try {
      const response = await fetch(`${API_URL}/dealers/profile/`, { method: 'POST', headers: { Authorization: `Token ${token ?? ''}` }, body: profileData })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.detail ?? 'Unable to save logo.')
      setLogoPreview(data.logo ?? logoPreview)
      setLogoMessage('Garage logo saved.')
      onDealerUpdated(data as Dealer)
      setLogoFile(null)
    } catch (error) {
      setLogoMessage(error instanceof Error ? error.message : 'Unable to save logo.')
    }
  }

  const saveDealerProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDealerMessage('')
    const profileData = new FormData()
    Object.entries(dealerForm).forEach(([field, value]) => profileData.append(field, value))
    if (logoFile) profileData.append('logo', logoFile)
    try {
      const response = await fetch(`${API_URL}/dealers/profile/`, { method: 'POST', headers: { Authorization: `Token ${token ?? ''}` }, body: profileData })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.detail ?? 'Unable to save dealer profile.')
      setDealerMessage('Dealer profile saved.')
      onDealerUpdated(data as Dealer)
      setLogoFile(null)
    } catch (error) {
      setDealerMessage(error instanceof Error ? error.message : 'Unable to save dealer profile.')
    }
  }

  const uploadVideo = async (car: Car, video: File) => {
    setUploadingVideoId(car.id)
    setVideoMessages(previous => ({ ...previous, [car.id]: '' }))
    const videoData = new FormData()
    videoData.append('video', video)

    try {
      const response = await fetch(`${API_URL}/cars/${car.id}/videos/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token ?? ''}` },
        body: videoData,
      })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.detail ?? 'Unable to upload this video.')
      setVideoMessages(previous => ({ ...previous, [car.id]: 'Video uploaded. Buyers can now watch it.' }))
    } catch (error) {
      setVideoMessages(previous => ({ ...previous, [car.id]: error instanceof TypeError ? 'The backend is unavailable.' : error instanceof Error ? error.message : 'Unable to upload this video.' }))
    } finally {
      setUploadingVideoId(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([field, value]) => formData.append(field, value))
      if (imageFile) formData.append('image', imageFile)
      if (videoFile) formData.append('video', videoFile)

      const response = await fetch(`${API_URL}/cars/create/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token ?? ''}` },
        body: formData,
      })
      const data = await readApiResponse(response)
      if (!response.ok) throw new Error(data.detail ?? 'Unable to publish this listing.')
      if (!data.token && !data.user && !data.id) throw new Error('The server returned an incomplete listing response.')
      onCarPosted(data as Car)
      setForm({ make: '', model: '', year: '', price: '', mileage: '', location: '', condition: 'Foreign Used', overview: '', fuel: 'Petrol', transmission: 'Automatic', engine: '', color: '' })
      setImageFile(null)
      setVideoFile(null)
      setMessage('Your car is now live in the marketplace.')
    } catch (error) {
      setMessage(error instanceof TypeError ? 'The backend is unavailable. Start Django on port 8000 and try again.' : error instanceof Error ? error.message : 'Unable to publish this listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [field]: value }))

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif", background: '#f8f7f4' }}>
      <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-200 transition-colors hover:text-white">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M12.5 5 7 10l5.5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Marketplace
          </button>
          <span className="font-display text-xl font-bold tracking-tight text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
          <button onClick={onLogout} className="text-sm font-medium text-gray-300 transition-colors hover:text-white">Log out</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-[28px] px-6 py-8 sm:px-10 sm:py-10" style={{ background: 'linear-gradient(120deg, #0d1b2a 0%, #17324a 65%, #244b5d 100%)' }}>
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border" style={{ borderColor: 'rgba(201,168,76,0.22)' }} />
          <div className="absolute -right-2 -top-8 h-40 w-40 rounded-full border" style={{ borderColor: 'rgba(201,168,76,0.16)' }} />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Dealer workspace</div>
            <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">Welcome, {user.name || user.username}</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-300">Publish your inventory and connect with buyers across Ghana.</p>
          </div>
          <div className="rounded-2xl border px-5 py-3 text-sm text-white" style={{ borderColor: 'rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)' }}><strong className="text-2xl" style={{ color: '#e8c96d' }}>{ownedCars.length}</strong><span className="ml-2 text-gray-300">active listings</span></div>
          </div>
        </div>

        <section className="mb-8 rounded-[22px] border bg-white p-5 shadow-sm" style={{ borderColor: '#e5e0d8' }}>
          <div className="flex items-center gap-4">
            {logoPreview ? <img src={logoPreview} alt="Garage logo preview" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold text-white" style={{ background: '#0d1b2a' }}>{(user.name || user.username).slice(0, 2).toUpperCase()}</div>}
            <div><div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Dealer profile</div><h2 className="mt-1 font-display text-2xl text-slate-900">Add your garage logo</h2><p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Your logo will appear on dealer cards and inventory pages.</p></div>
          </div>
          <form onSubmit={saveDealerProfile} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([['name', 'Garage name', 'Capitol Auto Sales'], ['location', 'Location', 'Airport Hills, Accra'], ['phone', 'Phone', '+233 26 988 7733'], ['email', 'Email', 'info@capitolautosalesgh.com'], ['hours', 'Opening hours', 'Mon - Sun · 9:00 AM - 8:00 PM'], ['specialties', 'Specialties', 'Luxury crossovers, Hybrid cars, Executive sedans']] as const).map(([field, label, placeholder]) => <div key={field}><label htmlFor={`dealer-${field}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>{label}</label><input id={`dealer-${field}`} type={field === 'email' ? 'email' : 'text'} required value={dealerForm[field]} onChange={event => setDealerForm(previous => ({ ...previous, [field]: event.target.value }))} placeholder={placeholder} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} /></div>)}
            <div className="sm:col-span-2"><label htmlFor="dealer-description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>About the dealer</label><textarea id="dealer-description" required rows={3} value={dealerForm.description} onChange={event => setDealerForm(previous => ({ ...previous, description: event.target.value }))} placeholder="Tell buyers about your dealership..." className="w-full resize-y rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} /></div>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><label htmlFor="dealer-logo" className="cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#f8f7f4]" style={{ borderColor: '#e5e0d8' }}>{logoFile ? logoFile.name : 'Choose garage logo'}<input id="dealer-logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setLogoFile(event.target.files?.[0] ?? null)} className="sr-only" /></label><button type="submit" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: '#0d1b2a' }}>Save dealer profile</button>{dealerMessage && <span role="status" className="text-sm" style={{ color: dealerMessage.includes('saved') ? '#006B3F' : '#a33a32' }}>{dealerMessage}</span>}</div>
          </form>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[22px] border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: '#e5e0d8' }}>
            <div className="mb-6">
              <div className="flex items-center gap-3"><div className="h-8 w-1 rounded-full" style={{ background: '#c9a84c' }} /><div><div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>New listing</div><h2 className="mt-1 font-display text-3xl text-slate-900">Post a car</h2></div></div>
              <p className="mt-3 text-sm" style={{ color: '#6b7280' }}>Add the details buyers need to make a confident decision.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="car-make" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Make</label>
                  <select id="car-make" required value={form.make} onChange={event => setForm(previous => ({ ...previous, make: event.target.value, model: '' }))} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}>
                    <option value="">Select make</option>
                    {availableMakes.map(make => <option key={make} value={make}>{make}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="car-model" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Model</label>
                  <select id="car-model" required value={form.model} disabled={!form.make} onChange={event => updateField('model', event.target.value)} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}>
                    <option value="">{form.make ? 'Select model' : 'Select a make first'}</option>
                    {availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                  </select>
                </div>
                {([['year', 'Year', '2024'], ['price', 'Price', 'GH₵ 250,000']] as const).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label htmlFor={`car-${field}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>{label}</label>
                    <input id={`car-${field}`} type={field === 'year' ? 'number' : 'text'} required value={form[field]} onChange={event => updateField(field, event.target.value)} placeholder={placeholder} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="car-mileage" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Mileage</label>
                  <input id="car-mileage" required value={form.mileage} onChange={event => updateField('mileage', event.target.value)} placeholder="18,400 km" className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
                </div>
                <div>
                  <label htmlFor="car-condition" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Condition</label>
                  <select id="car-condition" value={form.condition} onChange={event => updateField('condition', event.target.value)} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option>Brand New</option><option>Foreign Used</option><option>Ghana Used</option></select>
                </div>
              </div>
              <div>
                <label htmlFor="car-location" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Location</label>
                <input id="car-location" required value={form.location} onChange={event => updateField('location', event.target.value)} placeholder="East Legon, Accra" className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
              </div>
              <div>
                <label htmlFor="car-overview" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Vehicle overview</label>
                <textarea id="car-overview" required rows={4} value={form.overview} onChange={event => updateField('overview', event.target.value)} placeholder="Describe the vehicle, its condition, and what makes it a good choice..." className="w-full resize-y rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([['engine', 'Engine', '2.0L Turbo'], ['color', 'Color', 'Midnight Black']] as const).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label htmlFor={`car-${field}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>{label}</label>
                    <input id={`car-${field}`} required value={form[field]} onChange={event => updateField(field, event.target.value)} placeholder={placeholder} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="car-fuel" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Fuel</label>
                  <select id="car-fuel" value={form.fuel} onChange={event => updateField('fuel', event.target.value)} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select>
                </div>
                <div>
                  <label htmlFor="car-transmission" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Transmission</label>
                  <select id="car-transmission" value={form.transmission} onChange={event => updateField('transmission', event.target.value)} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}><option>Automatic</option><option>Manual</option><option>CVT</option></select>
                </div>
              </div>
              <div>
                <label htmlFor="car-image" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Car image</label>
                <label htmlFor="car-image" className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-3 transition hover:border-[#c9a84c]" style={{ borderColor: '#d8d0c4', background: '#f8f7f4' }}>
                  {imagePreview ? <img src={imagePreview} alt="Selected car preview" className="h-16 w-20 rounded-lg object-cover" /> : <div className="flex h-16 w-20 items-center justify-center rounded-lg" style={{ background: '#eae5db', color: '#8b5e0a' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m8 15 3-3 2 2 2-2 3 3M8 9h.01" /></svg></div>}
                  <span className="text-sm" style={{ color: '#6b7280' }}>{imageFile ? imageFile.name : 'Choose a JPG, PNG, or WebP image'}</span>
                  <input id="car-image" type="file" accept="image/jpeg,image/png,image/webp" required={!imageFile} onChange={event => setImageFile(event.target.files?.[0] ?? null)} className="sr-only" />
                </label>
              </div>
              <div>
                <label htmlFor="car-video" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4b5563' }}>Dealer video <span className="font-normal normal-case tracking-normal" style={{ color: '#9ca3af' }}>(optional)</span></label>
                <label htmlFor="car-video" className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 transition hover:border-[#c9a84c]" style={{ borderColor: '#d8d0c4', background: '#f8f7f4' }}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: '#eae5db', color: '#8b5e0a' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 12 2-2 4 4M8 16l2-2" /></svg></div>
                  <span className="text-sm" style={{ color: '#6b7280' }}>{videoFile ? videoFile.name : 'Choose an MP4, WebM, or QuickTime video'}</span>
                  <input id="car-video" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={event => setVideoFile(event.target.files?.[0] ?? null)} className="sr-only" />
                </label>
                <p className="mt-1.5 text-xs" style={{ color: '#9ca3af' }}>Buyers will see this in Dealer Media on the vehicle page.</p>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)' }}>{isSubmitting ? 'Publishing...' : 'Publish listing'}</button>
              {message && <p role="status" className="rounded-xl px-4 py-3 text-sm" style={{ background: message.includes('now live') ? '#edf7ef' : '#fff1f0', color: message.includes('now live') ? '#006B3F' : '#a33a32' }}>{message}</p>}
            </form>
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Showroom</div><h2 className="mt-2 font-display text-3xl text-slate-900">Your listings</h2></div><span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#edf7ef', color: '#006B3F' }}>{ownedCars.length} active</span></div>
            {ownedCars.length > 0 && videoUploadCar && <div className="mb-5 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#e5e0d8' }}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: '#fff7df', color: '#9a7a25' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 12 2-2 4 4M8 16l2-2" /></svg></div><div><h3 className="font-semibold text-slate-900">Add dealer video</h3><p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Upload a walkaround or test-drive video for buyers.</p></div></div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><select value={videoUploadCar.id} onChange={event => setVideoUploadCarId(Number(event.target.value))} className="w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none focus:ring-2 sm:flex-1" style={{ borderColor: '#e5e0d8', background: '#f8f7f4' }}>{ownedCars.map(car => <option key={car.id} value={car.id}>{car.year} {car.make} {car.model}</option>)}</select><label htmlFor="dashboard-video-upload" className="cursor-pointer rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#0d1b2a' }}>{uploadingVideoId === videoUploadCar.id ? 'Uploading...' : 'Choose video'}<input id="dashboard-video-upload" type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploadingVideoId === videoUploadCar.id} onChange={event => { const video = event.target.files?.[0]; if (video) void uploadVideo(videoUploadCar, video); event.currentTarget.value = '' }} className="sr-only" /></label></div>{videoMessages[videoUploadCar.id] && <p role="status" className="mt-3 text-sm" style={{ color: videoMessages[videoUploadCar.id].includes('uploaded') ? '#006B3F' : '#a33a32' }}>{videoMessages[videoUploadCar.id]}</p>}</div>}
            {!ownedCars.length && <div className="mb-5 rounded-2xl border border-dashed p-5 text-sm" style={{ borderColor: '#d8d0c4', background: '#fffdf7', color: '#6b7280' }}>Publish a listing first. Once your car is live, the dealer video upload will appear here so buyers can watch a walkaround or test drive.</div>}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {ownedCars.map(car => (
                <article key={car.id} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: '#e5e0d8' }}>
                  <div className="relative overflow-hidden"><img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#edf7ef', color: '#006B3F' }}>{car.condition}</span></div>
                  <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{car.year} {car.make} {car.model}</h3><div className="mt-2 text-xs" style={{ color: '#6b7280' }}>{car.mileage} · {car.location}</div></div><span className="font-display text-lg font-bold" style={{ color: '#c9a84c' }}>{car.price}</span></div><div className="mt-4 rounded-xl border border-dashed p-3" style={{ borderColor: '#d8d0c4', background: '#f8f7f4' }}><div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Dealer media</div><label htmlFor={`video-${car.id}`} className="block cursor-pointer text-sm font-semibold text-slate-900">{uploadingVideoId === car.id ? 'Uploading video...' : 'Upload walkaround video'}<input id={`video-${car.id}`} type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploadingVideoId === car.id} onChange={event => { const video = event.target.files?.[0]; if (video) void uploadVideo(car, video); event.currentTarget.value = '' }} className="sr-only" /></label>{videoMessages[car.id] && <p role="status" className="mt-2 text-xs" style={{ color: videoMessages[car.id].includes('uploaded') ? '#006B3F' : '#a33a32' }}>{videoMessages[car.id]}</p>}</div><button onClick={() => onViewCar(car)} className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: '#0d1b2a' }}>View details</button></div>
                </article>
              ))}
              {!ownedCars.length && <div className="rounded-2xl border border-dashed p-8 text-sm sm:col-span-2" style={{ borderColor: '#d8d0c4', color: '#6b7280' }}>You have no published cars yet. Add your first listing using the form.</div>}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [cars, setCars] = useState<Car[]>(FEATURED_CARS)
  const [dealers, setDealers] = useState<Dealer[]>(DEALERS)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchForm, setSearchForm] = useState({ make: '', location: '', price: '', condition: '' })
  const [activeSearch, setActiveSearch] = useState<typeof searchForm | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showDealerDetail, setShowDealerDetail] = useState(false)
  const [showDealerDirectory, setShowDealerDirectory] = useState(false)
  const [showListings, setShowListings] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [dealerMenuOpen, setDealerMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null)
  const [selectedCarId, setSelectedCarId] = useState<number>(FEATURED_CARS[0].id)
  const [selectedDealerName, setSelectedDealerName] = useState<string>(DEALERS[0].name)

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [carsResponse, dealersResponse] = await Promise.all([
          fetch(`${API_URL}/cars/`),
          fetch(`${API_URL}/dealers/`),
        ])

        if (!carsResponse.ok || !dealersResponse.ok) throw new Error('Catalog request failed')

        const [apiCars, apiDealers] = (await Promise.all([carsResponse.json(), dealersResponse.json()])) as [Car[], Omit<Dealer, 'inventory'>[]]

        setCars(apiCars)
        setDealers(apiDealers.map(dealer => ({
            ...dealer,
            inventory: apiCars
              .filter(car => car.dealer === dealer.name)
              .map(car => ({
                id: car.id,
                title: `${car.year} ${car.make} ${car.model}`,
                price: car.price,
                location: car.location,
                status: car.condition,
              })),
          })))
      } catch {
      }
    }

    void loadCatalog()
  }, [])

  const selectedCar = cars.find(car => car.id === selectedCarId) ?? cars[0]
  const selectedDealer = dealers.find(dealer => dealer.name === selectedDealerName) ?? dealers[0]
  const filteredCars = activeSearch
    ? cars.filter(car => {
        const makeMatches = !activeSearch.make || activeSearch.make === 'All Makes' || car.make.toLowerCase().includes(activeSearch.make.toLowerCase())
        const region = activeSearch.location
        const locationMatches = !region || region === 'All Regions' || car.location.toLowerCase().includes(region.replace('Greater Accra', 'Accra').toLowerCase())
        const conditionMatches = !activeSearch.condition || activeSearch.condition === 'Any Condition' || car.condition === activeSearch.condition
        const price = Number(car.price.replace(/[^0-9]/g, ''))
        const priceMatches = !activeSearch.price || activeSearch.price === 'Any Price'
          || (activeSearch.price === 'Under GH₵ 50,000' && price < 50000)
          || (activeSearch.price === 'GH₵ 50k–100k' && price >= 50000 && price <= 100000)
          || (activeSearch.price === 'GH₵ 100k–200k' && price > 100000 && price <= 200000)
          || (activeSearch.price === 'GH₵ 200k–400k' && price > 200000 && price <= 400000)
          || (activeSearch.price === 'GH₵ 400k+' && price > 400000)
        return makeMatches && locationMatches && conditionMatches && priceMatches
      })
    : cars

  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} onCreateAccount={() => { setShowLogin(false); setShowRegister(true) }} onLogin={user => { setCurrentUser(user); setShowLogin(false); setShowDashboard(true) }} />
  }

  if (showRegister) {
    return <RegisterPage onBack={() => setShowRegister(false)} onExistingAccount={() => { setShowRegister(false); setShowLogin(true) }} onLogin={user => { setCurrentUser(user); setShowRegister(false); setShowDashboard(true) }} />
  }

  if (showDealerDirectory) {
    return <DealerDirectoryPage dealers={dealers} onBack={() => setShowDealerDirectory(false)} onSelect={dealer => { setSelectedDealerName(dealer.name); setShowDealerDirectory(false); setShowDealerDetail(true) }} />
  }

  if (showListings) {
    return <ListingsPage cars={cars} dealers={dealers} onBack={() => setShowListings(false)} onViewCar={car => { setSelectedCarId(car.id); setShowListings(false); setShowProductDetail(true) }} />
  }

  if (showDashboard && currentUser) {
    return <DealerDashboardPage user={currentUser} cars={cars} onBack={() => setShowDashboard(false)} onLogout={() => { localStorage.removeItem('autoghana_token'); sessionStorage.removeItem('autoghana_token'); setCurrentUser(null); setShowDashboard(false) }} onViewCar={car => { setSelectedCarId(car.id); setShowDashboard(false); setShowProductDetail(true) }} onCarPosted={car => setCars(previous => [car, ...previous])} onDealerUpdated={dealer => setDealers(previous => { const exists = previous.some(item => item.id === dealer.id); return exists ? previous.map(item => item.id === dealer.id ? { ...item, ...dealer } : item) : [dealer, ...previous] })} />
  }

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (showProductDetail) {
    return <ProductDetailPage car={selectedCar} dealers={dealers} onBack={() => { setShowProductDetail(false); if (currentUser) setShowDashboard(true) }} />
  }

  if (showDealerDetail) {
    return <DealerDetailPage dealer={selectedDealer} cars={cars} onBack={() => setShowDealerDetail(false)} onViewCar={car => { setSelectedCarId(car.id); setShowDealerDetail(false); setShowProductDetail(true) }} />
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{ background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#0d1b2a" strokeWidth="2.5">
                  <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                Auto<span style={{ color: '#c9a84c' }}>Ghana</span>
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.filter(link => link !== 'Dealers').map(link => link === 'Buy a Car' ? (
                <button key={link} onClick={() => setShowListings(true)} className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white">{link}</button>
              ) : <a key={link} href="#" className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white">{link}</a>)}
              <div className="relative">
                <button onClick={() => { setShowDealerDirectory(true); setDealerMenuOpen(false) }} className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white">
                  Dealers
                </button>
                {dealerMenuOpen && (
                  <div className="absolute right-0 top-9 w-72 overflow-hidden rounded-2xl border bg-white p-2 shadow-2xl" style={{ borderColor: '#e5e0d8' }}>
                    <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9a7a25' }}>Browse dealer inventory</div>
                    {dealers.map(dealer => (
                      <button key={dealer.name} onClick={() => { setSelectedDealerName(dealer.name); setShowDealerDetail(true); setDealerMenuOpen(false) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f8f7f4]">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: dealer.color }}>{dealer.initials}</span>
                        <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{dealer.name}</span><span className="block truncate text-xs" style={{ color: '#6b7280' }}>{dealer.location} · {dealer.cars} cars</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              {currentUser && <button onClick={() => { localStorage.removeItem('autoghana_token'); sessionStorage.removeItem('autoghana_token'); setCurrentUser(null) }} className="text-sm font-medium text-gray-300 transition-colors hover:text-white">Log out</button>}
              <button onClick={() => currentUser ? setShowDashboard(true) : setShowLogin(true)} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
                List Your Car
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white p-2">
              <div className="w-5 space-y-1.5">
                <span className={`block h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t py-4 space-y-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {NAV_LINKS.filter(link => link !== 'Dealers').map(link => link === 'Buy a Car' ? (
                <button key={link} onClick={() => { setShowListings(true); setMobileMenuOpen(false) }} className="block py-1.5 text-left text-sm font-medium text-gray-300 transition-colors hover:text-white">{link}</button>
              ) : <a key={link} href="#" className="block py-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white">{link}</a>)}
              <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Dealer inventory</div>
                <div className="space-y-1">
                  {dealers.map(dealer => (
                    <button key={dealer.name} onClick={() => { setSelectedDealerName(dealer.name); setShowDealerDetail(true); setMobileMenuOpen(false) }} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-gray-300 transition hover:bg-white/10 hover:text-white">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: dealer.color }}>{dealer.initials}</span>
                      <span className="truncate">{dealer.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-3 flex flex-col gap-3">
                {currentUser && <button onClick={() => { localStorage.removeItem('autoghana_token'); sessionStorage.removeItem('autoghana_token'); setCurrentUser(null) }} className="text-left text-sm text-gray-300">Log out</button>}
                <button onClick={() => currentUser ? setShowDashboard(true) : setShowLogin(true)} className="px-5 py-2.5 rounded-lg text-sm font-semibold w-full" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
                  List Your Car
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="relative min-h-screen flex items-center overflow-hidden hero-fade">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1611147533125-9ca445f32036?w=1920&h=1080&fit=crop&auto=format" alt="Cars on a highway at night" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,27,42,0.92) 0%, rgba(13,27,42,0.75) 50%, rgba(13,27,42,0.60) 100%)' }} />
        </div>

        <div className="absolute top-0 left-0 right-0 flex h-1">
          <div className="flex-1" style={{ background: '#006B3F' }} />
          <div className="flex-1" style={{ background: '#FCD116' }} />
          <div className="flex-1" style={{ background: '#CE1126' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px" style={{ background: '#c9a84c' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                Ghana's #1 Car Marketplace
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Find Your<br />
              <span style={{ color: '#c9a84c' }}>Perfect Car</span><br />
              in Ghana
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Discover thousands of cars from trusted dealers and sellers across Ghana. Buy and sell with confidence.
            </p>

            <div className="flex flex-wrap gap-8 mb-10">
              {[['12,400+', 'Cars Listed'], ['840+', 'Verified Dealers'], ['16', 'Regions Covered']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white font-display">{num}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl rounded-2xl p-6 lg:p-8 shadow-2xl floating-card" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: '#6b7280' }}>Search Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Make', key: 'make', options: ['All Makes', ...CAR_MAKE_OPTIONS] },
                { label: 'Location', key: 'location', options: ['All Regions', 'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Volta', 'Central'] },
                { label: 'Max Price', key: 'price', options: ['Any Price', 'Under GH₵ 50,000', 'GH₵ 50k–100k', 'GH₵ 100k–200k', 'GH₵ 200k–400k', 'GH₵ 400k+'] },
                { label: 'Condition', key: 'condition', options: ['Any Condition', 'Brand New', 'Foreign Used', 'Ghana Used'] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>{label}</label>
                  <select
                    value={searchForm[key as keyof typeof searchForm]}
                    onChange={e => setSearchForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-medium appearance-none focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: '#e5e0d8', background: '#f8f7f4', color: '#0d1b2a' }}
                  >
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button onClick={() => { setActiveSearch(searchForm); document.getElementById('featured-cars')?.scrollIntoView({ behavior: 'smooth' }) }} className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)', color: '#ffffff' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Search Cars
            </button>
          </div>
        </div>
      </section>

      <section id="featured-cars" className="py-20 lg:py-28 section-reveal" style={{ background: '#f8f7f4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Handpicked For You</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: '#0d1b2a' }}>{activeSearch ? 'Search Results' : 'Featured Cars'}</h2>
              {activeSearch && <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>{filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} match your search.</p>}
            </div>
            <button onClick={() => setShowListings(true)} className="text-sm font-semibold flex items-center gap-1.5 transition-colors hover:opacity-70" style={{ color: '#c9a84c' }}>
              View all listings
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCars.map(car => (
              <div key={car.id} className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer card-hover-lift" style={{ background: '#ffffff', border: '1px solid #f0ede8' }}>
                <div className="relative overflow-hidden h-52 bg-gray-100">
                  <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: car.condition === 'Brand New' ? '#006B3F' : '#1e3a5f', color: '#ffffff' }}>
                      {car.condition}
                    </span>
                  </div>
                  <button onClick={() => toggleFavorite(car.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                    <HeartIcon filled={favorites.has(car.id)} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-base" style={{ color: '#0d1b2a' }}>{car.year} {car.make} {car.model}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                        <span className="text-xs ml-1" style={{ color: '#6b7280' }}>(Verified)</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg font-display" style={{ color: '#c9a84c' }}>{car.price}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #f0ede8' }}>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6b7280' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <circle cx="8" cy="8" r="6" /><path d="M8 4v4l2 2" />
                      </svg>
                      {car.mileage}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6b7280' }}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <path d="M8 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM8 14v.5M2 8H1.5M14 8h.5" /><path d="M8 9.5A1.5 1.5 0 108 6.5 1.5 1.5 0 008 9.5z" />
                      </svg>
                      {car.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #f0ede8' }}>
                    <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
                      <span className="text-xs mr-1">🏪</span>{car.dealer}
                    </span>
                    <button onClick={() => { setSelectedCarId(car.id); setShowProductDetail(true) }} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ background: '#0d1b2a', color: '#ffffff' }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filteredCars.length && <div className="rounded-2xl border border-dashed p-10 text-center sm:col-span-2 lg:col-span-3" style={{ borderColor: '#d8d0c4', color: '#6b7280' }}>No cars match those filters. Try widening your search.</div>}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 section-reveal" style={{ background: '#0d1b2a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>All Brands Available</span>
              <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white">Browse by Make</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CAR_MAKES.map(brand => (
              <button key={brand.name} className="group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 card-hover-lift" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <img src={brand.logo} alt={`${brand.name} logo`} className="h-9 w-9 object-contain" loading="lazy" />
                </div>
                <span className="text-sm font-semibold text-white text-center leading-snug">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 section-reveal" style={{ background: '#f0ede8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Every Style</span>
              <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: '#0d1b2a' }}>Browse by Body Type</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BODY_TYPES.map(type => (
              <button key={type.name} className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-hover-lift" style={{ border: '1px solid #e5e0d8' }}>
                <span className="flex h-12 items-center justify-center text-[#0d1b2a] transition-transform duration-200 group-hover:scale-110">
                  <BodyTypeIcon type={type.icon} />
                </span>
                <div className="text-center">
                  <div className="font-semibold text-sm" style={{ color: '#0d1b2a' }}>{type.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#c9a84c' }}>{type.count} cars</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 section-reveal" style={{ background: '#f8f7f4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-px" style={{ background: '#c9a84c' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Trusted Partners</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold" style={{ color: '#0d1b2a' }}>Featured Dealers</h2>
            </div>
            <button onClick={() => setShowDealerDirectory(true)} className="text-sm font-semibold flex items-center gap-1.5 transition-colors hover:opacity-70" style={{ color: '#c9a84c' }}>
              View all dealers
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>

          <div className="grid gap-3">
            {dealers.map(dealer => (
              <div key={dealer.name} className="group grid grid-cols-1 gap-5 rounded-2xl border bg-white px-5 py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6" style={{ borderColor: '#e5e0d8' }}>
                <img src={dealerImage(dealer)} alt={`${dealer.name} profile`} className="h-20 w-20 rounded-full object-cover transition-transform duration-200 group-hover:scale-105" />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-2xl leading-tight" style={{ color: '#0d1b2a' }}>{dealer.name}</h3>
                    {dealer.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#006B3F' }}>
                        <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5">
                          <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm" style={{ color: '#6b7280' }}>
                    <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 flex-shrink-0">
                    <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
                    <circle cx="8" cy="6" r="1.5" />
                  </svg>
                  {dealer.location}
                    </span>
                    <span><strong style={{ color: '#0d1b2a' }}>{dealer.cars}</strong> listings</span>
                    <span><strong style={{ color: '#0d1b2a' }}>{dealer.rating.toFixed(1)}</strong> ★ rating</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDealerName(dealer.name)
                    setShowDealerDetail(true)
                  }}
                  className="inline-flex items-center gap-2 self-start text-sm font-semibold transition-all duration-200 hover:gap-3 sm:self-auto"
                  style={{ color: '#0d1b2a' }}
                >
                  View inventory
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 lg:py-32 section-reveal">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1692406069831-0bb7ea297645?w=1920&h=900&fit=crop&auto=format" alt="Car showroom" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,27,42,0.93) 0%, rgba(13,27,42,0.80) 100%)' }} />
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: 'linear-gradient(to bottom, #c9a84c, #e8c96d, #c9a84c)' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px" style={{ background: '#c9a84c' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c9a84c' }}>Sell Faster</span>
            <div className="w-8 h-px" style={{ background: '#c9a84c' }} />
          </div>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Have a Car<br />to <span style={{ color: '#c9a84c' }}>Sell?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
            Reach thousands of serious buyers across Ghana. List your car in minutes and sell for the best price.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#0d1b2a' }}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M10 3v14M3 10h14" strokeLinecap="round" />
              </svg>
              List Your Car Free
            </button>
            <button className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-white/10 flex items-center gap-2" style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff' }}>
              Learn How It Works
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-14">
            {[['⚡', 'List in 5 minutes'], ['🔒', 'Safe & Secure'], ['📱', 'Reach 50k+ buyers']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-gray-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: '#080f1a', color: '#d1d5db' }}>
        <div className="flex h-1">
          <div className="flex-1" style={{ background: '#006B3F' }} />
          <div className="flex-1" style={{ background: '#FCD116' }} />
          <div className="flex-1" style={{ background: '#CE1126' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-14">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#0d1b2a" strokeWidth="2.5">
                    <path d="M5 17H3a2 2 0 0 1-2-2v-4l4-5h12l4 5v4a2 2 0 0 1-2 2h-2" />
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </div>
                <span className="font-display text-xl font-bold text-white">Auto<span style={{ color: '#c9a84c' }}>Ghana</span></span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Ghana's most trusted car marketplace. Connecting buyers and verified dealers across all 16 regions since 2019.
              </p>
              <div className="flex gap-3 mt-6">
                {['FB', 'TW', 'IG', 'YT'].map(s => (
                  <a key={s} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {[{ title: 'Marketplace', links: ['Buy a Car', 'Sell a Car', 'Car Dealers', 'New Cars', 'Used Cars'] }, { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'] }, { title: 'Support', links: ['Help Centre', 'Safety Tips', 'Report a Scam', 'Privacy Policy', 'Terms of Service'] }].map(col => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: '📞', label: '+233 30 292 1100' },
              { icon: '✉️', label: 'hello@autoghana.com.gh' },
              { icon: '📍', label: 'Airport City, Accra, Ghana' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-gray-400">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <p className="text-xs text-gray-500">© 2026 AutoGhana Ltd. All rights reserved. Accra, Ghana.</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Made with</span>
              <span style={{ color: '#c9a84c' }}>♥</span>
              <span>for Ghana 🇬🇭</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
