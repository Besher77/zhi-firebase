import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Trash2, Edit2, X, Check, Loader2 } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '0.75rem'
};

const taifCenter = {
  lat: 21.2652,
  lng: 40.4045
};

const taifRestriction = {
  latLngBounds: {
    north: 21.45,
    south: 21.10,
    east: 40.65,
    west: 40.15,
  },
  strictBounds: false,
};

const mapOptions = {
  restriction: taifRestriction,
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export interface Address {
  id: string;
  name: string; // e.g. "Home", "Work"
  street: string;
  neighborhood?: string;
  building?: string;
  city: string;
  postalCode?: string;
  phone?: string;
  lat: number;
  lng: number;
}

export default function Addresses() {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [addressName, setAddressName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressBuilding, setAddressBuilding] = useState('');
  const [addressCity, setAddressCity] = useState('taif');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [mapError, setMapError] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBGQpcZ2b85jyvMFkCyuwqNsJH7_7khPOE'
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users', user.uid, 'addresses'));
      const snap = await getDocs(q);
      const addrList: Address[] = [];
      snap.forEach(doc => {
        addrList.push({ id: doc.id, ...doc.data() } as Address);
      });
      setAddresses(addrList);
    } catch (error) {
      console.error("Error fetching addresses", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAddresses();
    }
  }, [user, authLoading, fetchAddresses]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/" replace />;

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapError('');
      
      // Perform simple check if inside bounds
      if (
        lat > taifRestriction.latLngBounds.north ||
        lat < taifRestriction.latLngBounds.south ||
        lng > taifRestriction.latLngBounds.east ||
        lng < taifRestriction.latLngBounds.west
      ) {
         setMapError(isAr ? 'عفواً، التوصيل متاح داخل مدينة الطائف فقط' : 'Sorry, delivery is only available within Taif city');
         return;
      }
      
      setSelectedLocation({ lat, lng });
      performReverseGeocoding(lat, lng);
    }
  };

  const performReverseGeocoding = (lat: number, lng: number) => {
    if (!window.google) return;
    setGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setGeocoding(false);
      if (status === 'OK' && results && results[0]) {
        setAddressStreet(results[0].formatted_address);
      } else {
        setAddressStreet('');
      }
    });
  };

  const openAddModal = () => {
    if (addresses.length >= 3) return;
    setEditingId(null);
    setAddressName('');
    setAddressStreet('');
    setAddressNeighborhood('');
    setAddressBuilding('');
    setAddressCity('taif');
    setAddressPostalCode('');
    setAddressPhone('');
    setSelectedLocation(taifCenter);
    setMapError('');
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setAddressName(addr.name);
    setAddressStreet(addr.street);
    setAddressNeighborhood(addr.neighborhood || '');
    setAddressBuilding(addr.building || '');
    setAddressCity(addr.city || 'taif');
    setAddressPostalCode(addr.postalCode || '');
    setAddressPhone(addr.phone || '');
    setSelectedLocation({ lat: addr.lat, lng: addr.lng });
    setMapError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
        fetchAddresses();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleSave = async () => {
    if (!user || !selectedLocation || !addressName.trim()) return;
    setLoading(true);
    try {
      const addrId = editingId || Date.now().toString();
      await setDoc(doc(db, 'users', user.uid, 'addresses', addrId), {
        name: addressName,
        street: addressStreet,
        neighborhood: addressNeighborhood,
        building: addressBuilding,
        city: addressCity,
        postalCode: addressPostalCode,
        phone: addressPhone,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        updatedAt: serverTimestamp()
      });
      setIsModalOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Safe checks for Maps API
  if (loadError) {
    return <div className="text-center py-20 text-red-500">Error loading maps</div>;
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl py-20 min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-end mb-8 border-b border-border-light pb-6">
           <div>
             <h1 className="text-4xl font-serif text-coffee-dark mb-2">
               {isAr ? 'عناويني' : 'My Addresses'}
             </h1>
             <p className="text-coffee-muted text-sm max-w-md">
               {isAr ? 'إدارة عناوين التوصيل الخاصة بك. يمكنك إضافة حتى 3 عناوين داخل مدينة الطائف.' : 'Manage your delivery addresses. You can add up to 3 addresses within Taif region.'}
             </p>
           </div>
           
           <button 
             onClick={openAddModal}
             disabled={addresses.length >= 3}
             className="px-6 py-3 bg-brand text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-coffee-dark transition-colors flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Plus className="w-4 h-4 me-2" />
             {isAr ? 'إضافة عنوان' : 'Add New'}
           </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-coffee-light rounded-2xl p-12 text-center border border-border-light/50">
             <MapPin className="w-16 h-16 text-coffee-muted/30 mx-auto mb-4" />
             <h3 className="text-xl font-serif font-bold text-coffee-dark mb-2">
               {isAr ? 'لا توجد عناوين' : 'No Addresses Found'}
             </h3>
             <p className="text-coffee-muted mb-6">
               {isAr ? 'لم تقم بإضافة أي عناوين للتوصيل حتى الآن.' : 'You haven\'t added any delivery addresses yet.'}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border-light hover:border-brand/30 transition-colors relative group">
                <div className="flex items-start mb-4">
                   <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center shrink-0 me-4">
                     <MapPin className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-lg font-bold text-coffee-dark font-sans capitalize">{addr.name}</h3>
                     <p className="text-sm text-coffee-muted mt-1 leading-relaxed">
                       {addr.city === 'taif' ? (isAr ? 'الطائف' : 'Taif') : (isAr ? 'أخرى' : 'Other')}
                       {addr.postalCode && ` • ${addr.postalCode}`}
                     </p>
                     <p className="text-sm text-coffee-dark mt-1 leading-relaxed font-medium">
                       {addr.street}
                       {addr.neighborhood && ` • ${addr.neighborhood}`}
                       {addr.building && ` • ${addr.building}`}
                     </p>
                     {addr.phone && (
                       <p className="text-xs text-brand mt-1 flex items-center gap-1">
                         <span>+966{addr.phone}</span>
                       </p>
                     )}
                   </div>
                </div>
                
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t border-border-light/50">
                  <button 
                    onClick={() => openEditModal(addr)}
                    className="p-2 text-coffee-muted hover:text-brand transition-colors bg-gray-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-coffee-muted hover:text-red-500 transition-colors bg-gray-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Map Picker Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !loading && setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border-light flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-coffee-dark">
                  {editingId ? (isAr ? 'تحديث العنوان' : 'Edit Address') : (isAr ? 'إضافة عنوان جديد' : 'Add New Address')}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-coffee-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-5">
                  {/* Address Name */}
                  <div>
                    <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                      {isAr ? 'اسم العنوان (مثال: المنزل، العمل)' : 'Address Name (e.g. Home, Work)'} *
                    </label>
                    <input 
                      type="text" 
                      value={addressName}
                      onChange={(e) => setAddressName(e.target.value)}
                      placeholder={isAr ? "المنزل" : "Home"}
                      className="w-full p-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm"
                    />
                  </div>

                  {/* City Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                        {isAr ? 'المدينة' : 'City'} *
                      </label>
                      <input
                        type="text"
                        value={isAr ? 'الطائف' : 'Taif'}
                        disabled
                        className="w-full p-4 bg-gray-100 border border-border-light rounded-xl font-sans text-sm text-coffee-muted cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                        {isAr ? 'الرمز البريدي' : 'Postal Code'}
                      </label>
                      <input 
                        type="text" 
                        value={addressPostalCode}
                        onChange={(e) => setAddressPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder={isAr ? "26511" : "26511"}
                        maxLength={5}
                        className="w-full p-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm text-center tracking-widest"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Map Selection */}
                  <div>
                     <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                      {isAr ? 'حدد الموقع على الخريطة (انقر على الخريطة)' : 'Select Location on Map (Click on map)'} *
                     </label>

                     <div className="relative rounded-xl overflow-hidden border-2 border-border-light shadow-inner">
                       {!isLoaded ? (
                         <div className="h-[300px] flex items-center justify-center bg-gray-100">
                           <Loader2 className="w-8 h-8 animate-spin text-brand" />
                         </div>
                       ) : (
                         <GoogleMap
                            mapContainerStyle={{...mapContainerStyle, height: '300px'}}
                            center={selectedLocation || taifCenter}
                            zoom={14}
                            options={mapOptions}
                            onClick={handleMapClick}
                            onLoad={(map) => mapRef.current = map}
                         >
                            {selectedLocation && (
                              <Marker 
                                position={selectedLocation}
                                draggable={true}
                                onDragEnd={(e) => {
                                  if (e.latLng) {
                                    const lat = e.latLng.lat();
                                    const lng = e.latLng.lng();
                                    setSelectedLocation({ lat, lng });
                                    performReverseGeocoding(lat, lng);
                                  }
                                }}
                              />
                            )}
                         </GoogleMap>
                       )}
                     </div>
                     {mapError && (
                       <p className="mt-2 text-red-500 text-sm font-bold flex items-center bg-red-50 p-2 rounded-lg">
                         <X className="w-4 h-4 me-1" /> {mapError}
                       </p>
                     )}
                     <p className="mt-2 text-xs text-coffee-muted bg-coffee-light/30 p-2 rounded-lg">
                        {isAr ? 'انقر على الخريطة أو اسحب العلامة لتحديد الموقع. التوصيل متاح داخل مدينة الطائف فقط.' : 'Click on map or drag marker to set location. Delivery available within Taif only.'}
                     </p>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                      {isAr ? 'الشارع / عنوان الخريطة' : 'Street / Map Address'}
                    </label>
                    <div className="relative">
                      {geocoding && <Loader2 className="absolute top-4 end-4 w-4 h-4 animate-spin text-brand" />}
                      <textarea 
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                        placeholder={isAr ? "مكة المكرمة، الطائف، شارع..." : "Street name..."}
                        rows={2}
                        className="w-full p-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Neighborhood & Building */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                        {isAr ? 'الحي' : 'Neighborhood'}
                      </label>
                      <input 
                        type="text" 
                        value={addressNeighborhood}
                        onChange={(e) => setAddressNeighborhood(e.target.value)}
                        placeholder={isAr ? "مثال: شهار" : "e.g. Shahar"}
                        className="w-full p-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                        {isAr ? 'تفاصيل المبنى' : 'Building Details'}
                      </label>
                      <input 
                        type="text" 
                        value={addressBuilding}
                        onChange={(e) => setAddressBuilding(e.target.value)}
                        placeholder={isAr ? "رقم المبنى، الشقة" : "Bldg, Apt #"}
                        className="w-full p-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-bold text-coffee-dark mb-2 font-sans">
                      {isAr ? 'رقم الهاتف للتواصل' : 'Contact Phone Number'}
                    </label>
                    <div className="relative">
                      <span className="absolute top-1/2 -translate-y-1/2 start-4 text-coffee-muted font-bold">+966</span>
                      <input 
                        type="tel" 
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder={isAr ? "5xxxxxxxx" : "5xxxxxxxx"}
                        maxLength={9}
                        className="w-full ps-16 pe-4 py-4 bg-gray-50 border border-border-light rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all font-sans text-sm tracking-widest"
                        dir="ltr"
                      />
                    </div>
                    <p className="text-xs text-coffee-muted mt-1">
                      {isAr ? 'سيتم التواصل معك على هذا الرقم لتوصيل الطلب' : 'You will be contacted on this number for delivery'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-light bg-gray-50 flex justify-end">
                 <button 
                   onClick={handleSave}
                   disabled={loading || geocoding || !addressName.trim() || !selectedLocation || !!mapError}
                   className="px-8 py-3 bg-brand text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-coffee-dark transition-colors disabled:opacity-50 flex items-center"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 me-2" />}
                   {isAr ? 'حفظ العنوان' : 'Save Address'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
