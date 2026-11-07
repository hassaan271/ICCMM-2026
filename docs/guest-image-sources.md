# Guest portrait sources

Machine-readable version: `src/data/guests/image-sources.ts`. Files: `public/assets/images/guests/`.

All published portraits are taken from **Guest Info.docx**, supplied by the ICCMM-26 organisers. Each photo sits in the same table row as the guest it belongs to, which is how identity was matched. The document doesn't name the photographer or where each image came from. No web, stock or AI-generated images are used.

**What's needed from the organisers:** confirm that each guest agrees to their photo appearing on the website, and send larger originals for the low-resolution images.

| Guest | Source (embedded file) | Source URL | Licence / permission | Attribution | Verification | Size used |
|---|---|---|---|---|---|---|
| M. G. P. L. Narayana | image22.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match (same photo in both tables) | 720×900 |
| Janab Mohammed Waliullah | image18.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 720×900 |
| Janab Zafar Javeed | image10.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 720×900 |
| Prof. Dr.-Ing. Marina Tropmann-Frick | HD photo supplied directly by the organisers (Stage 9) | none | Organiser-supplied; guest consent to confirm | none stated | Matches the earlier Guest Info photo | 1429×2000 source, 720×900 and 360×450 crops |
| Dr. Merugu Lakshminarayana | image4.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match (Inaugural table) | 160×200 **low-res** |
| Mr. Syed Aamer Javeed | image12.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 121×151 **low-res** |
| Mr. Syed Omer Javeed | image1.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 144×180 **low-res** |
| Mr. N. Venkatesh | image17.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 388×485 |
| Dr. Krishna Kanth Avalur | image3.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 501×626 |
| Dr. Moiz M. | image16.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 135×168 **low-res** |
| Dr. C. Thirmal | image19.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 720×900 |
| Dr. R. Sridevi | image20.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 160×200 **low-res** |
| Dr. Sanju Tiwari | image11.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 96×120 **low-res** |
| Dr. M. A. Jabbar | image14.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 400×500 |
| Dr. Y. Vijayalatha Reddy | image5.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 400×500 |
| Dr. K. Jaya Sankar | image15.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 196×245 **low-res** |
| Dr. Jyoti Singhai | image9.png | none | Organiser-supplied; guest consent to confirm | none stated | Row match | 409×511 |
| Prof. Krishna Reddy P. | photo supplied directly by the organisers (Stage 8) | none | Organiser-supplied; guest consent to confirm | none stated | Supplied as his portrait | 650×650 source, cropped to 520×650 |

Not published (marked NO, or unverified): Joginder Tanikella (image7), Sreenivas Jasti (image6), Bala Prasad Peddigari (image2) and "Dr. Merugu Laxmi" (image21). None of these files were copied into the project.

## Replacing a photo

1. Save the approved image as `public/assets/images/guests/<guest-id>.webp`, cropped to 4:5 and ideally 720×900. If it's wider than 360 px, also save a 360×450 copy as `<guest-id>-360.webp`.
2. Update that guest's entry in `src/data/guests/image-sources.ts`: `w`/`h`, `source`, `license`, and remove `lowRes`. For a guest who currently shows a placeholder, replace `missing(...)` with `supplied(...)`.
