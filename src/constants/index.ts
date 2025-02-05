export { SEO, SEO_OG } from './SEO';
export { FOOTER_LINKS, FOOTER_BG_IMAGE, FOOTER_DETAILS } from './footer';
export { HEADER_LINKS } from './header';
export { ORDERS_CONTENT } from './profile-my-orders';
export { FAQS_CONTENT, FAQS_DETAILS } from './faqs';
export { AdminLinks, type AdminNavigation, ADMIN_TABS } from './admin-navigation';
export { paymentStatusOptions, orderStatusOptions, paymentMethodOptions, customerTypeOptions } from './status-options';
export { ABOUT_US_CONTENT, ABOUT_DEVELOPERS } from './about-us';
export { PRIVACY_POLICY_CONTENT } from './privacy-policy';
export { TERMS_OF_SERVICE_CONTENT } from './terms-of-service';
export { emailContent, emailStyles } from './email';


export const ITEMS_PER_PAGE = 10;

export const EMPTY_PAGINATED_RESPONSE = { 
  data: [], 
  metadata: { 
    total: 0, 
    page: 1, 
    lastPage: 1, 
    hasNextPage: false, 
    hasPrevPage: false 
  } 
};
