import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Company Info */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.png"
                  alt="Automation System Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold">Automation System</span>
            </div>
            <p className="text-gray-300 text-sm">
              Efficient inventory management and automation solutions for modern businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/daily-history" className="text-gray-300 hover:text-white transition-colors">
                  Transaction History
                </Link>
              </li>
              <li>
                <Link href="/liquid-demo" className="text-gray-300 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>Email: support@automationsystem.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Business St, Suite 100</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Automation System. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
