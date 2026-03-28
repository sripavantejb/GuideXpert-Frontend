import { Link } from 'react-router-dom';

export default function BlogCTASection() {
  return (
    <div className="mt-16 overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-10 text-center ring-1 ring-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          The Students Are Already Waiting
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          Join our growing community of professionals and start earning by guiding students towards their dream careers. Share your unique perspective and make a real impact.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(15,23,42,0)] transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-[0_10px_40px_-10px_rgba(15,23,42,0.8)] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Stay Today
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
