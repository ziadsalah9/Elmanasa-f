import React from 'react'
import { Link } from 'react-router-dom'
import { getUser, isAdmin } from '../auth'

const Home = () => {
  const user = getUser()
  const admin = isAdmin(user)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">تعلّم · تدرّب · تفوّق</span>
          <h1>
            منصة <span className="text-gradient">أ/رشا يحيى</span> التعليمية
          </h1>
          <p>
            مكان واحد للملاحظات والاختبارات التفاعلية. اختبر نفسك بأسئلة اختيار من متعدد
            وأسئلة مقالية، واحصل على تصحيح ونتائج من المعلم بكل سهولة.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg">اذهب إلى لوحتي</Link>
                <Link to="/quizzes" className="btn btn-ghost btn-lg">استعرض الاختبارات</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">ابدأ الآن مجاناً</Link>
                <Link to="/login" className="btn btn-ghost btn-lg">لدي حساب بالفعل</Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div>
              <strong>9</strong>
              <span>صفوف دراسية</span>
            </div>
            <div>
              <strong>2</strong>
              <span>أنواع أسئلة</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>تصحيح من المعلم</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-head">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
              <span>اختبار تجريبي</span>
            </div>
            <div className="hero-question">
              <p>ما هو ناتج ٧ × ٨ ؟</p>
              <div className="hero-options">
                <span className="hero-option">٤٨</span>
                <span className="hero-option hero-option-correct">٥٦</span>
                <span className="hero-option">٦٣</span>
                <span className="hero-option">٧٢</span>
              </div>
            </div>
            <div className="hero-question">
              <p>اشرح أهمية الماء للكائنات الحية.</p>
              <div className="hero-written">إجابة مقالية سيتم تصحيحها يدوياً…</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>كل ما تحتاجه للنجاح</h2>
          <p>أدوات بسيطة وقوية للطالب والمعلم</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>اختبارات متنوعة</h3>
            <p>أسئلة اختيار من متعدد وأسئلة مقالية مكتوبة في اختبار واحد.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>تصحيح دقيق</h3>
            <p>المعلم يراجع إجاباتك المقالية ويمنحك الدرجات مع ملاحظات مفيدة.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>نتائج واضحة</h3>
            <p>اعرف درجتك فور اعتماد المعلم، مع مراجعة كل سؤال وإجابته الصحيحة.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>تجربة آمنة</h3>
            <p>حسابك الخاص يحفظ نتائجك ويمنع تكرار تقديم نفس الاختبار.</p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-heading">
          <h2>كيف تعمل المنصة؟</h2>
          <p>ثلاث خطوات بسيطة</p>
        </div>
        <div className="step-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>سجّل حسابك</h3>
            <p>أدخل بياناتك ورقم هاتفك، وأكّد التسجيل برمز التحقق.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h3>حل الاختبار</h3>
            <p>اختر الاختبار المناسب لمستواك وأجب على جميع الأسئلة.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h3>استلم نتيجتك</h3>
            <p>يصبح الاختبار جاهزاً للمراجعة، وبعد التصحيح تظهر درجتك مباشرة.</p>
          </div>
        </div>
      </section>

      {admin && (
        <section className="section">
          <div className="cta-panel">
            <div>
              <h2>لوحة المعلم</h2>
              <p>أنشئ اختبارات جديدة وتابع تسليمات الطلاب وصححها من مكان واحد.</p>
            </div>
            <Link to="/quizzes/create" className="btn btn-primary btn-lg">إنشاء اختبار جديد</Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
