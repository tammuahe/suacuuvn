import { FaFacebookF } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';
import { SiZalo } from 'react-icons/si';
import { welcome } from '@/routes';

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-md-outline-variant bg-md-surface">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-16">
                {/* Top Grid */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Company */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-md-on-surface">
                            Viện Khoa học Dược liệu Việt Nam
                        </h3>

                        <p className="text-sm leading-relaxed text-md-on-surface-variant">
                            Địa chỉ:{' '}
                            <a
                                href="https://maps.app.goo.gl/QD2gdFmAHaSDrjQy7"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline-offset-4 hover:text-md-primary hover:underline"
                            >
                                Số 22 phố Thành Công, Phường Giảng Võ, TP Hà
                                Nội, Việt Nam
                            </a>
                        </p>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-md-on-surface">
                            Thông tin
                        </h4>

                        <ul className="space-y-3 text-sm text-md-on-surface-variant">
                            <li>
                                <a
                                    href={welcome().url}
                                    className="block transition hover:text-md-primary"
                                >
                                    Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`${welcome().url}#product`}
                                    className="block transition hover:text-md-primary"
                                >
                                    Sản phẩm
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-md-on-surface">
                            Hotline liên hệ
                        </h4>

                        <div className="flex items-start gap-3">
                            <FaPhone className="mt-1 text-md-primary" />

                            <div className="space-y-1">
                                <a
                                    href="tel:0962320120"
                                    className="block font-semibold text-md-on-surface transition hover:text-md-primary"
                                >
                                    0962.320.120
                                </a>
                                <p className="text-xs text-md-on-surface-variant">
                                    (Tất cả các ngày trong tuần)
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-3">
                            <IoIosMail className="mt-1" />
                            <a
                                href="mailto:aaipharma.vn@gmail.com"
                                className="text-sm text-md-on-surface transition hover:text-md-primary"
                            >
                                aaipharma.vn@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-md-on-surface">
                            Kết nối với chúng tôi
                        </h4>

                        <div className="flex gap-3">
                            <a
                                href="https://www.facebook.com/aaipharma.vn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-md-surface-container transition hover:-translate-y-1 hover:bg-md-outline-variant"
                            >
                                <FaFacebookF size={16} />
                            </a>

                            <a
                                href="https://www.tiktok.com/@aai_pharma__"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-md-surface-container transition hover:-translate-y-1 hover:bg-md-outline-variant"
                            >
                                <FaTiktok size={16} />
                            </a>

                            <a
                                href="https://zalo.me/0962320120"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-md-surface-container transition hover:-translate-y-1 hover:bg-md-outline-variant"
                            >
                                <SiZalo size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-md-outline-variant pt-6 md:flex-row">
                    <p className="text-center text-sm text-md-on-surface-variant md:text-left">
                        © 2024 AAiPharma - Viện khoa học dược liệu Việt Nam
                    </p>

                    <a
                        href="http://online.gov.vn/Home/WebDetails/139713"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-md-on-surface-variant transition hover:text-md-primary"
                    >
                        Thông báo bộ công thương
                    </a>
                </div>
            </div>
        </footer>
    );
}
