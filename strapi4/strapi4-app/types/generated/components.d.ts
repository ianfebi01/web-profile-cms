import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaDescription: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 50;
        maxLength: 160;
      }>;
    metaImage: Attribute.Media<'images' | 'files' | 'videos'>;
    metaSocial: Attribute.Component<'shared.meta-social', true>;
    keywords: Attribute.Text;
    metaRobots: Attribute.String;
    structuredData: Attribute.JSON;
    metaViewport: Attribute.String;
    canonicalURL: Attribute.String;
  };
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface NavItemsNavItems extends Schema.Component {
  collectionName: 'components_nav_items_nav_items';
  info: {
    displayName: 'Nav Items';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    page: Attribute.Relation<
      'nav-items.nav-items',
      'oneToOne',
      'api::page.page'
    >;
    url: Attribute.String;
    pageAnchor: Attribute.String;
    description: Attribute.Text;
    newTab: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface NavCategoriesNavCategories extends Schema.Component {
  collectionName: 'components_nav_categories_nav_categories';
  info: {
    displayName: 'Nav Categories';
    description: '';
  };
  attributes: {
    navItems: Attribute.Component<'nav-items.nav-items', true>;
    categoryName: Attribute.String;
  };
}

export interface ContentComponentsTextLeftImageRight extends Schema.Component {
  collectionName: 'components_content_components_text_left_image_rights';
  info: {
    displayName: 'textLeftImageRight';
    description: '';
  };
  attributes: {
    image: Attribute.Media<'images'> & Attribute.Required;
    fullWidthBgImage: Attribute.Boolean & Attribute.DefaultTo<false>;
    reverse: Attribute.Boolean & Attribute.DefaultTo<false>;
    fullWidth: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    buttons: Attribute.Component<'arrays.button', true>;
    bodyCopy: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'Markdown';
          preset: 'standard';
        }
      >;
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
    biggerColumn: Attribute.Enumeration<['image', 'content']>;
  };
}

export interface ContentComponentsSmallBanner extends Schema.Component {
  collectionName: 'components_content_components_small_banners';
  info: {
    displayName: 'SmallBanner';
    description: '';
  };
  attributes: {
    buttons: Attribute.Component<'arrays.button', true>;
    backgroundImage: Attribute.Media<'images'>;
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsSimpleCards extends Schema.Component {
  collectionName: 'components_content_components_simple_cards';
  info: {
    displayName: 'SimpleCards';
  };
  attributes: {
    cards: Attribute.Component<'arrays.simple-card', true> & Attribute.Required;
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsQuote extends Schema.Component {
  collectionName: 'components_content_components_quotes';
  info: {
    displayName: 'quote';
    description: '';
  };
  attributes: {
    quote: Attribute.Text & Attribute.Required;
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsPartnerSearch extends Schema.Component {
  collectionName: 'components_content_components_partner_searches';
  info: {
    displayName: 'partnerSearch';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsNewsSearch extends Schema.Component {
  collectionName: 'components_content_components_news_searches';
  info: {
    displayName: 'newsSearch';
  };
  attributes: {
    sectionSettings: Attribute.Component<
      'common-fields.section-settings',
      true
    >;
  };
}

export interface ContentComponentsJobSearch extends Schema.Component {
  collectionName: 'components_content_components_job_searches';
  info: {
    displayName: 'jobSearch';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsFeaturedPortofolios extends Schema.Component {
  collectionName: 'components_content_components_featured_portofolios';
  info: {
    displayName: 'featuredPortofolios';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsFeaturedPeoples extends Schema.Component {
  collectionName: 'components_content_components_featured_peoples';
  info: {
    displayName: 'featuredPeoples';
    description: '';
  };
  attributes: {
    title: Attribute.Enumeration<['leadership-team', 'board-of-directors']> &
      Attribute.Required;
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsFeaturedNews extends Schema.Component {
  collectionName: 'components_content_components_featured_news';
  info: {
    displayName: 'featuredNews';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsFeaturedExperiences extends Schema.Component {
  collectionName: 'components_content_components_featured_experiences';
  info: {
    displayName: 'featuredExperiences';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsDivider extends Schema.Component {
  collectionName: 'components_content_components_dividers';
  info: {
    displayName: 'divider';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface ContentComponentsBodyCopy extends Schema.Component {
  collectionName: 'components_content_components_body_copies';
  info: {
    displayName: 'bodyCopy';
    description: '';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
    content: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'Markdown';
          preset: 'standard';
        }
      >;
  };
}

export interface ContentComponentsArbitrary extends Schema.Component {
  collectionName: 'components_content_components_arbitraries';
  info: {
    displayName: 'arbitrary';
    description: '';
  };
  attributes: {
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
    arbitrary: Attribute.JSON;
    identifier: Attribute.String & Attribute.Required;
  };
}

export interface ContentComponentsAccordian extends Schema.Component {
  collectionName: 'components_content_components_accordians';
  info: {
    displayName: 'accordian';
  };
  attributes: {
    items: Attribute.Component<'arrays.items', true>;
    sectionSettings: Attribute.Component<'common-fields.section-settings'>;
  };
}

export interface CommonFieldsSectionSettings extends Schema.Component {
  collectionName: 'components_common_fields_section-settings';
  info: {
    displayName: 'sectionSettings';
    description: '';
  };
  attributes: {
    heading: Attribute.String;
    centreText: Attribute.Boolean;
    largeHeading: Attribute.Boolean;
    description: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'Markdown';
          preset: 'standard';
        }
      >;
    paddingTop: Attribute.Enumeration<
      [
        'pt-0',
        'pt-2',
        'pt-4',
        'pt-6',
        'pt-8',
        'pt-10',
        'pt-12',
        'pt-16',
        'pt-20',
        'pt-24'
      ]
    >;
    paddingBottom: Attribute.Enumeration<
      [
        'pb-0',
        'pb-2',
        'pb-4',
        'pb-6',
        'pb-8',
        'pb-10',
        'pb-12',
        'pb-16',
        'pb-20',
        'pb-24'
      ]
    >;
    htmlId: Attribute.String;
    bgColour: Attribute.Relation<
      'common-fields.section-settings',
      'oneToOne',
      'api::colour.colour'
    >;
    marginTop: Attribute.Enumeration<
      [
        'mt-0',
        'mt-2',
        'mt-4',
        'mt-6',
        'mt-8',
        'mt-10',
        'mt-12',
        'mt-16',
        'mt-20',
        'mt-24'
      ]
    >;
    marginBottom: Attribute.Enumeration<
      [
        'mb-0',
        'mb-2',
        'mb-4',
        'mb-6',
        'mb-8',
        'mb-10',
        'mb-12',
        'mb-16',
        'mb-20',
        'mb-24'
      ]
    >;
  };
}

export interface BannerComponentsProfileBanner extends Schema.Component {
  collectionName: 'components_banner_components_profile_banners';
  info: {
    displayName: 'profileBanner';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    bio: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'Markdown';
          preset: 'standard';
        }
      >;
    bannerImage: Attribute.Media<'images'> & Attribute.Required;
    socials: Attribute.Relation<
      'banner-components.profile-banner',
      'oneToMany',
      'api::social.social'
    >;
    avatar: Attribute.Media<'images'> & Attribute.Required;
  };
}

export interface BannerComponentsCarousel extends Schema.Component {
  collectionName: 'components_banner_components_carousels';
  info: {
    displayName: 'carousel';
  };
  attributes: {};
}

export interface BannerComponentsBannerStandard extends Schema.Component {
  collectionName: 'components_banner_components_banner_standards';
  info: {
    displayName: 'bannerStandard';
    description: '';
  };
  attributes: {
    heading: Attribute.String;
    subHeading: Attribute.String;
    backgroundImage: Attribute.Media<'images'>;
    watermarkLeft: Attribute.Enumeration<['triangle', 'octagon']>;
    watermarkRight: Attribute.Enumeration<
      ['triangle', 'circle', 'infinity', 'octagon']
    >;
    watermarkLeftOverflow: Attribute.Boolean & Attribute.DefaultTo<false>;
    watermarkRightOverflow: Attribute.Boolean & Attribute.DefaultTo<false>;
    description: Attribute.Text;
    links: Attribute.Component<'arrays.links', true>;
    backgroundVideo: Attribute.Media<'videos'>;
  };
}

export interface ArraysSocials extends Schema.Component {
  collectionName: 'components_arrays_socials';
  info: {
    displayName: 'socials';
    description: '';
  };
  attributes: {
    url: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    platform: Attribute.Enumeration<
      ['LinkedIn', 'Facebook', 'Twitter', 'Instagram', 'Email']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'LinkedIn'>;
  };
}

export interface ArraysSimpleCard extends Schema.Component {
  collectionName: 'components_arrays_simple_cards';
  info: {
    displayName: 'SimpleCard';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    bigTitleSize: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface ArraysLinks extends Schema.Component {
  collectionName: 'components_arrays_links';
  info: {
    displayName: 'links';
  };
  attributes: {
    link: Attribute.String;
    newTab: Attribute.Boolean;
    title: Attribute.String;
  };
}

export interface ArraysItems extends Schema.Component {
  collectionName: 'components_arrays_items';
  info: {
    displayName: 'item';
    description: '';
  };
  attributes: {
    heading: Attribute.String & Attribute.Required;
    content: Attribute.RichText &
      Attribute.Required &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'Markdown';
          preset: 'standard';
        }
      >;
  };
}

export interface ArraysImageGalery extends Schema.Component {
  collectionName: 'components_arrays_image_galeries';
  info: {
    displayName: 'imageGalery';
  };
  attributes: {
    media: Attribute.Media<'images' | 'videos'> & Attribute.Required;
    caption: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'Markdown';
          preset: 'standard';
        }
      >;
  };
}

export interface ArraysGallery extends Schema.Component {
  collectionName: 'components_arrays_galleries';
  info: {
    displayName: 'gallery';
  };
  attributes: {
    image: Attribute.Media<'images'> & Attribute.Required;
    caption: Attribute.Text;
  };
}

export interface ArraysColumns extends Schema.Component {
  collectionName: 'components_arrays_columns';
  info: {
    displayName: 'columns';
  };
  attributes: {
    content: Attribute.RichText;
  };
}

export interface ArraysButton extends Schema.Component {
  collectionName: 'components_arrays_buttons';
  info: {
    displayName: 'button';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    url: Attribute.String;
    newTab: Attribute.Boolean & Attribute.DefaultTo<false>;
    style: Attribute.Enumeration<['primary', 'secondary', 'transparent']> &
      Attribute.DefaultTo<'primary'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.seo': SharedSeo;
      'shared.meta-social': SharedMetaSocial;
      'nav-items.nav-items': NavItemsNavItems;
      'nav-categories.nav-categories': NavCategoriesNavCategories;
      'content-components.text-left-image-right': ContentComponentsTextLeftImageRight;
      'content-components.small-banner': ContentComponentsSmallBanner;
      'content-components.simple-cards': ContentComponentsSimpleCards;
      'content-components.quote': ContentComponentsQuote;
      'content-components.partner-search': ContentComponentsPartnerSearch;
      'content-components.news-search': ContentComponentsNewsSearch;
      'content-components.job-search': ContentComponentsJobSearch;
      'content-components.featured-portofolios': ContentComponentsFeaturedPortofolios;
      'content-components.featured-peoples': ContentComponentsFeaturedPeoples;
      'content-components.featured-news': ContentComponentsFeaturedNews;
      'content-components.featured-experiences': ContentComponentsFeaturedExperiences;
      'content-components.divider': ContentComponentsDivider;
      'content-components.body-copy': ContentComponentsBodyCopy;
      'content-components.arbitrary': ContentComponentsArbitrary;
      'content-components.accordian': ContentComponentsAccordian;
      'common-fields.section-settings': CommonFieldsSectionSettings;
      'banner-components.profile-banner': BannerComponentsProfileBanner;
      'banner-components.carousel': BannerComponentsCarousel;
      'banner-components.banner-standard': BannerComponentsBannerStandard;
      'arrays.socials': ArraysSocials;
      'arrays.simple-card': ArraysSimpleCard;
      'arrays.links': ArraysLinks;
      'arrays.items': ArraysItems;
      'arrays.image-galery': ArraysImageGalery;
      'arrays.gallery': ArraysGallery;
      'arrays.columns': ArraysColumns;
      'arrays.button': ArraysButton;
    }
  }
}
