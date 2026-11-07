// Image-source record for guest portraits (kept apart from the biographies in ./index.ts).
//
// Every published portrait comes from the organisers' own "Guest Info.docx", where each photo sits in the
// row of the guest it belongs to. The original photographer / upstream source is not stated in that file,
// so each image is marked "organiser-supplied" and needs the organisers' confirmation that the guest has
// agreed to its use. No third-party or web images are used, and no portrait is AI-generated.
//
// Files: public/assets/images/guests/<id>.webp (≤720 px wide, 4:5) and <id>-360.webp, cropped from the
// supplied image without upscaling. `lowRes` marks sources under 300 px wide; ask for a larger original.

export type ImageStatus = 'organiser-supplied' | 'missing';

export type GuestImage = {
  guest: string;
  status: ImageStatus;
  /** Where the file came from */
  source: string;
  sourceUrl: string | null;
  license: string;
  attribution: string | null;
  verification: string;
  /** Rendered size of the largest file */
  w: number;
  h: number;
  lowRes?: boolean;
  /** CSS object-position for the crop */
  focus?: string;
};

const DOC = 'Guest Info.docx (supplied by the ICCMM-26 organisers)';
const LICENSE = 'Provided by the organisers for the conference website; written consent of the guest to be confirmed';
const OK = 'Identity matched by document row (photo placed beside the guest name in Guest Info)';

const supplied = (guest: string, file: string, w: number, h: number, extra: Partial<GuestImage> = {}): GuestImage => ({
  guest, status: 'organiser-supplied', source: `${DOC}, embedded ${file}`, sourceUrl: null,
  license: LICENSE, attribution: null, verification: OK, w, h, ...extra,
});

const missing = (guest: string): GuestImage => ({
  guest, status: 'missing', source: 'None supplied', sourceUrl: null, license: 'n/a', attribution: null,
  verification: 'No portrait in Guest Info; placeholder shown until an approved photograph is supplied', w: 0, h: 0,
});

export const guestImages: Record<string, GuestImage> = Object.fromEntries(([
  supplied('mgpl-narayana', 'image22.png', 720, 900, { verification: `${OK}; same photo in both tables` }),
  supplied('mohammed-waliullah', 'image18.png', 720, 900),
  supplied('zafar-javeed', 'image10.png', 720, 900),
  {
    guest: 'marina-tropmann-frick', status: 'organiser-supplied', source: 'HD photograph supplied directly by the ICCMM-26 organisers (Stage 9; replaces Guest Info image13.png)', sourceUrl: null,
    license: LICENSE, attribution: null, verification: 'Supplied by the organisers as the portrait of Prof. Dr.-Ing. Marina Tropmann-Frick; matches the earlier Guest Info photo', w: 720, h: 900, focus: '50% 30%',
  },
  supplied('merugu-lakshminarayana', 'image4.png', 160, 200, { lowRes: true }),
  supplied('syed-aamer-javeed', 'image12.png', 121, 151, { lowRes: true }),
  supplied('syed-omer-javeed', 'image1.png', 144, 180, { lowRes: true }),
  supplied('n-venkatesh', 'image17.png', 388, 485),
  supplied('krishna-kanth-avalur', 'image3.png', 501, 626),
  supplied('moiz-m', 'image16.png', 135, 168, { lowRes: true }),
  supplied('c-thirmal', 'image19.png', 720, 900),
  supplied('sridevi', 'image20.png', 160, 200, { lowRes: true }),
  supplied('sanju-tiwari', 'image11.png', 96, 120, { lowRes: true }),
  supplied('ma-jabbar', 'image14.png', 400, 500),
  supplied('vijay-latha', 'image5.png', 400, 500),
  supplied('k-jaya-sankar', 'image15.png', 196, 245, { lowRes: true }),
  supplied('jyoti-singhai', 'image9.png', 409, 511),
  {
    guest: 'krishna-reddy-p', status: 'organiser-supplied', source: 'Photograph supplied directly by the ICCMM-26 organisers (Stage 8)', sourceUrl: null,
    license: LICENSE, attribution: null, verification: 'Supplied by the organisers as the portrait of Prof. P. Krishna Reddy.', w: 520, h: 650, focus: '50% 35%',
  },
] as GuestImage[]).map((i) => [i.guest, i]));

export const portraitOf = (id: string) => {
  const img = guestImages[id];
  if (!img || img.status === 'missing') return null;
  return {
    src: `assets/images/guests/${id}.webp`,
    srcSet: img.w > 360 ? `assets/images/guests/${id}-360.webp 360w, assets/images/guests/${id}.webp ${img.w}w` : undefined,
    w: img.w, h: img.h, focus: img.focus ?? '50% 30%', lowRes: !!img.lowRes,
  };
};
