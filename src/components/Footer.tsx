import { Facebook, Twitter, Instagram, DiscIcon as Pinterest, Mail, Phone, MapPin, User, Heart, ShoppingBag, Youtube, Linkedin, Globe } from 'lucide-react';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom Snapchat Icon Component
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.42.42 0 0 1 .17-.029c.077 0 .158.018.237.054.3.15.39.39.39.71 0 .429-.311.72-.609.826-.358.124-.659.177-.938.23-.225.04-.436.077-.627.144-.223.08-.387.195-.465.39a.84.84 0 0 0-.031.193c0 .202.11.395.279.541.429.36.674.704.779 1.128.063.248.155.512.272.799.226.536.466 1.096.794 1.594.16.24.349.468.561.678.522.522 1.133.724 1.9.556.24-.057.394-.024.522.044a.89.89 0 0 1 .353.397c.104.223.11.46.023.685-.174.436-.68.634-1.254.634-.602 0-1.153-.108-1.66-.32a4.09 4.09 0 0 1-.606-.304c-.098-.066-.195-.132-.29-.2-.142-.1-.283-.196-.42-.286-.37-.245-.727-.47-1.07-.654a8.79 8.79 0 0 0-1.88-.77 8.4 8.4 0 0 0-1.16-.22c-.075.48-.232.9-.47 1.252-.396.587-.96.989-1.675 1.195-.141.044-.289.082-.441.114-.56.11-1.233.167-2.006.167-.745 0-1.395-.052-1.944-.156-.168-.033-.327-.07-.48-.113-.72-.21-1.287-.616-1.683-1.206-.237-.353-.395-.777-.469-1.26-.395.054-.806.13-1.231.225-.555.124-1.112.283-1.656.473-.384.133-.753.284-1.098.449-.164.079-.323.163-.475.251-.098.059-.196.12-.293.18-.177.11-.36.224-.55.331a4.09 4.09 0 0 1-.607.304c-.506.211-1.057.32-1.66.32-.573 0-1.08-.198-1.253-.634-.088-.225-.082-.462.023-.685a.89.89 0 0 1 .352-.397c.13-.068.283-.1.523-.044.766.168 1.378-.034 1.9-.556.212-.21.4-.437.56-.678.329-.498.569-1.058.795-1.594.117-.287.209-.551.271-.8.106-.423.351-.767.78-1.127.169-.147.279-.34.279-.541 0-.066-.01-.13-.03-.193-.079-.195-.243-.31-.466-.39-.19-.067-.401-.104-.627-.144-.278-.053-.58-.106-.937-.23-.299-.106-.61-.397-.61-.826 0-.32.09-.56.39-.71.08-.036.16-.054.237-.054.058 0 .116.01.17.03.375.18.734.285 1.034.3.198 0 .326-.044.4-.09-.008-.164-.018-.33-.03-.51l-.002-.06c-.104-1.628-.23-3.654.3-4.847C7.684 1.07 11.04.793 12.03.793h.176zm-.165 1.452c-.852 0-3.608.227-4.655 2.64-.258.583-.18 2.267-.116 3.584.012.238.023.468.03.69.043 1.132.335 1.83.871 2.074.17.078.357.115.555.115.448 0 .915-.19 1.388-.565.483-.383.974-.958 1.459-1.712.137-.22.262-.438.376-.65.364-.683.652-1.314.857-1.878.206-.565.31-1.083.31-1.54 0-.513-.13-.967-.388-1.35-.26-.384-.607-.685-1.04-.9-.436-.217-.93-.325-1.477-.325-.037 0-.074.002-.11.007z"/>
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState<{id: string, platform: string, url: string, icon: string}[]>([]);
  const [contactEmail, setContactEmail] = useState('support@zhicoffee.sa');
  const [contactPhone, setContactPhone] = useState('+966 50 000 0000');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.socialLinks) {
            setSocialLinks(data.socialLinks);
          }
          if (data.contactEmail) {
            setContactEmail(data.contactEmail);
          }
          if (data.contactPhone) {
            setContactPhone(data.contactPhone);
          }
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <section className="bg-coffee-light py-20 relative text-center">
        <div className="absolute top-0 start-0 w-full -translate-y-[98%] z-20 pointer-events-none" dir="ltr">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-24 text-coffee-light shrink-0" preserveAspectRatio="none">
            <path d="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z" fill="currentColor">
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z;
                          M0,60 C400,-40 1000,120 1440,40 L1440,120 L0,120 Z;
                          M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z"
              />
            </path>
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-4xl font-serif text-coffee-dark mb-4 tracking-wide">{t('footer.subscribe')}</h2>
          <p className="text-coffee-muted mb-8 italic font-serif">
            {t('footer.subDesc')}
          </p>

          <form className="flex flex-col sm:flex-row max-w-xl mx-auto gap-4 sm:gap-0" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder={t('footer.placeholder')}
              className="flex-1 bg-transparent border-b border-t border-s sm:border-e-0 border-coffee-muted/30 px-6 py-4 outline-none font-sans text-xs tracking-widest placeholder:text-coffee-muted focus:border-coffee-dark transition-colors rounded-full sm:rounded-e-none text-start"
            />
            <button className="bg-coffee-dark text-white px-10 py-4 rounded-full sm:rounded-s-none font-sans text-xs font-bold tracking-widest hover:bg-brand transition-colors">
              {t('footer.btn')}
            </button>
          </form>
        </div>

        <div className="absolute bottom-0 start-0 w-full translate-y-[98%] z-20 pointer-events-none" dir="ltr">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-24 text-coffee-dark shrink-0" preserveAspectRatio="none">
            <path d="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z" fill="currentColor">
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z;
                          M0,60 C400,-40 1000,120 1440,40 L1440,120 L0,120 Z;
                          M0,40 C400,120 1000,-40 1440,60 L1440,120 L0,120 Z"
              />
            </path>
          </svg>
        </div>
      </section>

      <footer className="bg-coffee-dark pt-32 pb-16 text-white/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

            <div className="md:col-span-2">
              <Link to="/" className="mb-6 block">
                <img src={logo} alt="ZHI Coffee" className="h-14 w-auto object-contain" />
              </Link>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm text-justify">
                {t('footer.desc')}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Mail className="w-4 h-4 text-brand" />
                  <span>{contactEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Phone className="w-4 h-4 text-brand" />
                  <span>{contactPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span>{t('footer.location', 'Taif, Saudi Arabia')}</span>
                </div>
              </div>

              {/* Dynamic Social Media Links */}
              <div className="flex flex-wrap gap-3 mt-6">
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => (
                    <a 
                      key={link.id}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:border-brand transition-colors text-white"
                      title={link.platform}
                    >
                      {link.icon === 'facebook' && <Facebook className="w-4 h-4" />}
                      {link.icon === 'twitter' && <Twitter className="w-4 h-4" />}
                      {link.icon === 'instagram' && <Instagram className="w-4 h-4" />}
                      {link.icon === 'youtube' && <Youtube className="w-4 h-4" />}
                      {link.icon === 'linkedin' && <Linkedin className="w-4 h-4" />}
                      {link.icon === 'tiktok' && <TikTokIcon className="w-4 h-4" />}
                      {link.icon === 'snapchat' && <SnapchatIcon className="w-4 h-4" />}
                      {link.icon === 'globe' && <Globe className="w-4 h-4" />}
                    </a>
                  ))
                ) : (
                  // Default social links if none configured
                  <>
                    <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:border-brand transition-colors text-white"><Facebook className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:border-brand transition-colors text-white"><Twitter className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand hover:border-brand transition-colors text-white"><Instagram className="w-4 h-4" /></a>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-sans text-sm font-bold uppercase tracking-widest text-white mb-6">{t('footer.orders')}</h4>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/help" className="hover:text-brand transition-colors">{t('footer.helpLink', 'Help and advice')}</Link></li>
                <li><Link to="/shipping" className="hover:text-brand transition-colors">{t('footer.shippingLink', 'Shipping & Returns')}</Link></li>
                <li><Link to="/terms" className="hover:text-brand transition-colors">{t('footer.termsLink', 'Terms and conditions')}</Link></li>
                <li><Link to="/return-exchange" className="hover:text-brand transition-colors">{t('footer.returnLink', 'Return & Exchange Policy')}</Link></li>
                <li><Link to="/refund" className="hover:text-brand transition-colors">{t('footer.refundLink', 'Refund Policy')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans text-sm font-bold uppercase tracking-widest text-white mb-6">{t('footer.myacct')}</h4>
              <ul className="space-y-4 text-sm text-white/60">
                {user ? (
                  <>
                    <li>
                      <Link to="/orders" className="hover:text-brand transition-colors flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        {t('footer.myOrders', 'My Orders')}
                      </Link>
                    </li>
                    <li>
                      <Link to="/favorites" className="hover:text-brand transition-colors flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {t('footer.myWishlist', 'My Wishlist')}
                      </Link>
                    </li>
                    <li>
                      <Link to="/addresses" className="hover:text-brand transition-colors flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('footer.myAddresses', 'My Addresses')}
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/?auth=login" className="hover:text-brand transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t('footer.login', 'Login')}
                      </Link>
                    </li>
                    <li>
                      <Link to="/?auth=signup" className="hover:text-brand transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t('footer.register', 'Register Account')}
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

          </div>

          {/* Commercial Registration & Legal */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-white/50">
              <span>{t('footer.rights')}</span>
              <span className="hidden md:block">|</span>
              <span>{t('footer.commercialReg', 'Commercial Registration')}: <strong className="text-white/70">1234567890</strong></span>
              <span className="hidden md:block">|</span>
              <span>{t('footer.licensedBy', 'Licensed by Saudi Ministry of Commerce')}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
            <p className="mb-4 md:mb-0">{t('footer.securePayment', 'Secure Payment Methods')}</p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50 grayscale" referrerPolicy="no-referrer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-4 opacity-50 grayscale" referrerPolicy="no-referrer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4 opacity-50 grayscale" referrerPolicy="no-referrer" />
              <span className="text-white/40">Mada</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
