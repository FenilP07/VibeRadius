export default function StyleGuide() {
  const colors = [
    { name: 'Primary', class: 'bg-primary', hex: '#E07A3D' },
    { name: 'Primary Dark', class: 'bg-primary-dark', hex: '#C4612A' },
    { name: 'Primary Light', class: 'bg-primary-light', hex: '#F4A574' },
    { name: 'Primary Subtle', class: 'bg-primary-subtle', hex: '#FEF3EB' },
    { name: 'Surface', class: 'bg-surface', hex: '#FFFFFF' },
    { name: 'Surface Alt', class: 'bg-surface-alt', hex: '#FDF5ED' },
    { name: 'Surface BG', class: 'bg-surface-bg', hex: '#FFF8F0' },
    { name: 'Accent', class: 'bg-accent', hex: '#5C4033' },
    { name: 'Accent Dark', class: 'bg-accent-dark', hex: '#3D2B1F' },
    { name: 'Accent Charcoal', class: 'bg-accent-charcoal', hex: '#2E2E2E' },
    { name: 'Success', class: 'bg-success', hex: '#2D8A4E' },
    { name: 'Success Light', class: 'bg-success-light', hex: '#E8F5ED' },
    { name: 'Error', class: 'bg-error', hex: '#C93B3B' },
    { name: 'Error Light', class: 'bg-error-light', hex: '#FDEEEE' },
    { name: 'Warning', class: 'bg-warning', hex: '#D4920A' },
    { name: 'Warning Light', class: 'bg-warning-light', hex: '#FEF7E6' },
    { name: 'Info', class: 'bg-info', hex: '#3B82C9' },
    { name: 'Info Light', class: 'bg-info-light', hex: '#EEF5FD' },
  ]

  const darkColors = [
    { name: 'Dark BG', class: 'bg-dark-bg', hex: '#1A1512' },
    { name: 'Dark Surface', class: 'bg-dark-surface', hex: '#2A2320' },
    { name: 'Dark Surface Light', class: 'bg-dark-surface-light', hex: '#3D332D' },
  ]

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-surface-bg p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            🎨 Style Guide
          </h1>
          <p className="text-text-secondary">
            Design system for the Café Music Request App
          </p>
        </div>

        {/* Colors Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Colors
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {colors.map((color) => (
              <div
                key={color.name}
                className="text-center cursor-pointer group"
                onClick={() => copyToClipboard(color.hex)}
              >
                <div
                  className={`${color.class} h-20 rounded-lg shadow-sm border border-black/10 group-hover:scale-105 transition-transform`}
                />
                <p className="mt-2 text-text-primary font-medium text-sm">
                  {color.name}
                </p>
                <code className="text-text-muted text-xs">{color.hex}</code>
              </div>
            ))}
          </div>

          {/* Dark Mode Colors */}
          <h3 className="text-lg font-medium text-text-primary mt-8 mb-4">
            Dark Mode Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {darkColors.map((color) => (
              <div
                key={color.name}
                className="text-center cursor-pointer group"
                onClick={() => copyToClipboard(color.hex)}
              >
                <div
                  className={`${color.class} h-20 rounded-lg shadow-sm border border-white/10 group-hover:scale-105 transition-transform`}
                />
                <p className="mt-2 text-text-primary font-medium text-sm">
                  {color.name}
                </p>
                <code className="text-text-muted text-xs">{color.hex}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Typography
          </h2>
          <div className="bg-surface p-8 rounded-xl shadow-sm space-y-4">
            <h1 className="text-5xl font-bold text-text-primary">Heading 1</h1>
            <h2 className="text-4xl font-bold text-text-primary">Heading 2</h2>
            <h3 className="text-3xl font-semibold text-text-primary">Heading 3</h3>
            <h4 className="text-2xl font-semibold text-text-primary">Heading 4</h4>
            <h5 className="text-xl font-medium text-text-primary">Heading 5</h5>
            <h6 className="text-lg font-medium text-text-primary">Heading 6</h6>
            <hr className="border-primary-subtle" />
            <p className="text-text-primary">
              Body text primary - Use this for main content and important information.
            </p>
            <p className="text-text-secondary">
              Body text secondary - Use this for supporting content and descriptions.
            </p>
            <p className="text-text-muted">
              Body text muted - Use this for timestamps, hints, and less important info.
            </p>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Buttons
          </h2>
          <div className="bg-surface p-8 rounded-xl shadow-sm space-y-6">
            {/* Primary Buttons */}
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">
                Primary
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Primary Button
                </button>
                <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  Small Primary
                </button>
                <button className="bg-primary/50 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                  Disabled
                </button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">
                Secondary / Outline
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="border-2 border-primary text-primary hover:bg-primary-subtle px-6 py-3 rounded-lg font-medium transition-colors">
                  Secondary Button
                </button>
                <button className="border-2 border-accent text-accent hover:bg-surface-alt px-6 py-3 rounded-lg font-medium transition-colors">
                  Accent Outline
                </button>
              </div>
            </div>

            {/* Ghost & Dark Buttons */}
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">
                Ghost & Dark
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="text-primary hover:bg-primary-subtle px-6 py-3 rounded-lg font-medium transition-colors">
                  Ghost Button
                </button>
                <button className="bg-accent-dark hover:bg-accent-charcoal text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Dark Button
                </button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">
                With Icons
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                  <span>➕</span> Add Song
                </button>
                <button className="border-2 border-primary text-primary hover:bg-primary-subtle px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                  <span>🔍</span> Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Inputs */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Form Inputs
          </h2>
          <div className="bg-surface p-8 rounded-xl shadow-sm space-y-6 max-w-lg">
            {/* Text Input */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Default Input
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-4 py-3 rounded-lg bg-surface-bg border border-accent/20 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Search Input
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search songs..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface-bg border border-accent/20 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Input with Error */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Input with Error
              </label>
              <input
                type="text"
                placeholder="Required field"
                className="w-full px-4 py-3 rounded-lg bg-error-light border border-error text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
              />
              <p className="mt-1 text-error text-sm">This field is required</p>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Textarea
              </label>
              <textarea
                placeholder="Add a note..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-surface-bg border border-accent/20 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Select */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Select
              </label>
              <select className="w-full px-4 py-3 rounded-lg bg-surface-bg border border-accent/20 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Cards
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Default Card */}
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-primary-subtle">
              <h3 className="text-text-primary font-semibold text-lg">
                Default Card
              </h3>
              <p className="text-text-secondary mt-2">
                Basic card with subtle border
              </p>
            </div>

            {/* Song Card */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-primary-subtle hover:shadow-md hover:border-primary transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-subtle rounded-lg flex items-center justify-center text-2xl">
                  🎵
                </div>
                <div className="flex-1">
                  <h3 className="text-text-primary font-semibold">Tum Hi Ho</h3>
                  <p className="text-text-secondary text-sm">Arijit Singh</p>
                  <span className="text-text-muted text-xs">Table 5</span>
                </div>
              </div>
            </div>

            {/* Highlighted Card */}
            <div className="bg-primary-subtle p-6 rounded-xl border border-primary/30">
              <h3 className="text-text-primary font-semibold text-lg">
                🎶 Now Playing
              </h3>
              <p className="text-text-secondary mt-2">
                Highlighted/active state card
              </p>
            </div>

            {/* Dark Card */}
            <div className="bg-accent-dark p-6 rounded-xl">
              <h3 className="text-white font-semibold text-lg">Dark Card</h3>
              <p className="text-white/70 mt-2">For admin panel or dark sections</p>
            </div>

            {/* Stats Card */}
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-primary-subtle">
              <p className="text-text-muted text-sm uppercase tracking-wide">
                Songs in Queue
              </p>
              <p className="text-4xl font-bold text-primary mt-2">24</p>
            </div>

            {/* CTA Card */}
            <div className="bg-primary p-6 rounded-xl text-white">
              <h3 className="font-semibold text-lg">Scan to Request</h3>
              <p className="text-white/80 mt-2 text-sm">
                Add your favorite songs to the queue
              </p>
              <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
                Scan QR Code
              </button>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Alerts & Notifications
          </h2>
          <div className="space-y-4 max-w-xl">
            <div className="bg-success-light text-success px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="text-lg">✓</span>
              <span>Song added to queue successfully!</span>
            </div>
            <div className="bg-error-light text-error px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="text-lg">✕</span>
              <span>Failed to add song. Please try again.</span>
            </div>
            <div className="bg-warning-light text-warning px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="text-lg">⚠</span>
              <span>Queue is almost full. Only 3 slots remaining.</span>
            </div>
            <div className="bg-info-light text-info px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="text-lg">ℹ</span>
              <span>Scan the QR code at your table to request songs.</span>
            </div>
          </div>
        </section>

        {/* Badges & Tags */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Badges & Tags
          </h2>
          <div className="bg-surface p-8 rounded-xl shadow-sm">
            <div className="flex flex-wrap gap-3">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Now Playing
              </span>
              <span className="bg-primary-subtle text-primary px-3 py-1 rounded-full text-sm font-medium">
                In Queue
              </span>
              <span className="bg-success-light text-success px-3 py-1 rounded-full text-sm font-medium">
                Added
              </span>
              <span className="bg-warning-light text-warning px-3 py-1 rounded-full text-sm font-medium">
                Pending
              </span>
              <span className="bg-accent-dark text-white px-3 py-1 rounded-full text-sm font-medium">
                Admin
              </span>
              <span className="border border-primary text-primary px-3 py-1 rounded-full text-sm font-medium">
                Table 5
              </span>
            </div>
          </div>
        </section>

        {/* Dark Mode Preview */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Dark Mode Preview (Customer App)
          </h2>
          <div className="bg-dark-bg p-8 rounded-xl">
            <div className="max-w-sm mx-auto space-y-4">
              <h3 className="text-dark-text text-xl font-semibold text-center">
                🎵 Request a Song
              </h3>
              <p className="text-dark-text-secondary text-center text-sm">
                Search and add songs to the café playlist
              </p>
              <input
                type="text"
                placeholder="Search songs..."
                className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-surface-light text-dark-text placeholder:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="bg-dark-surface p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-dark-surface-light rounded-lg flex items-center justify-center">
                    🎵
                  </div>
                  <div className="flex-1">
                    <p className="text-dark-text font-medium">Shape of You</p>
                    <p className="text-dark-text-secondary text-sm">Ed Sheeran</p>
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-text-muted py-8 border-t border-primary-subtle">
          <p>Café Music Request App — Style Guide</p>
          <p className="text-sm mt-1">Click on any color to copy its hex code</p>
        </footer>
      </div>
    </div>
  )
}