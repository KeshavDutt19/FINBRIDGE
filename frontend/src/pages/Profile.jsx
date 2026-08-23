import { useState } from 'react';

import {
  UserRound,
  GraduationCap,
  Wallet,
  Target,
  Save,
  Building2,
} from 'lucide-react';

import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const [profile, setProfile] =
    useState({
      disabilityStatus: false,
      ...(user?.profile || {}),
    });

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setSaved(false);

    try {
      await updateProfile(profile);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } finally {
      setSaving(false);
    }
  }

  const groups = [
    {
      title: 'Personal information',
      icon: UserRound,
      description:
        'Basic details used to improve your recommendations.',

      fields: [
        ['age', 'Age', 'number'],
        ['state', 'State'],
        ['city', 'City'],
        ['gender', 'Gender'],
        ['category', 'Category'],
      ],
    },

    {
      title: 'Academic information',
      icon: GraduationCap,
      description:
        'Education details used for scholarship matching.',

      fields: [
        [
          'educationLevel',
          'Current education level',
        ],

        ['course', 'Course'],

        ['institution', 'Institution'],

        [
          'academicScore',
          'Academic percentage/CGPA',
          'number',
        ],

        [
          'yearOfStudy',
          'Year of study',
        ],
      ],
    },

    {
      title: 'Financial information',
      icon: Wallet,
      description:
        'Financial details used for eligibility checks.',

      fields: [
        [
          'annualFamilyIncome',
          'Annual family income',
          'number',
        ],

        [
          'employmentStatus',
          'Employment status',
        ],
      ],
    },

    {
      title: 'Loan preferences',
      icon: Target,
      description:
        'Optional preferences for loan recommendations.',

      fields: [
        ['loanType', 'Loan type'],

        [
          'desiredAmount',
          'Desired amount',
          'number',
        ],

        [
          'preferredTenure',
          'Preferred tenure in months',
          'number',
        ],
      ],
    },
  ];

  return (
    <PageShell
      title="Profile"
      eyebrow="Eligibility inputs"
      subtitle="Keep your information current so FinBridge can provide more relevant scholarship and loan discovery results."
    >
      <form onSubmit={submit}>

        <div className="grid gap-5">

          {groups.map(
            ({
              title,
              icon: Icon,
              description,
              fields: groupFields,
            }) => (
              <section
                className="
                  fb-card
                  p-6
                  sm:p-7
                "
                key={title}
              >

                {/* =========================
                    SECTION HEADER
                ========================== */}

                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f4f1ea]
                      text-[#375b32]
                      transition-transform
                      duration-300
                      hover:scale-105
                    "
                  >
                    <Icon size={20} />
                  </div>

                  <div>

                    <h2
                      className="
                        text-xl
                        font-semibold
                        tracking-[-0.025em]
                      "
                    >
                      {title}
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-black/40
                      "
                    >
                      {description}
                    </p>

                  </div>

                </div>

                {/* =========================
                    FIELDS
                ========================== */}

                <div
                  className="
                    mt-6
                    grid
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >

                  {groupFields.map(
                    ([key, label, type = 'text']) => (
                      <label
                        className="
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-black/40
                        "
                        key={key}
                      >

                        {label}

                        <input
                          className="field mt-2"
                          type={type}
                          value={
                            profile[key] ?? ''
                          }
                          onChange={(event) =>
                            setProfile({
                              ...profile,

                              [key]:
                                type === 'number'
                                  ? event.target
                                      .value === ''
                                    ? ''
                                    : Number(
                                        event.target
                                          .value
                                      )
                                  : event.target
                                      .value,
                            })
                          }
                        />

                      </label>
                    )
                  )}

                </div>

              </section>
            )
          )}

          {/* =================================
              PRIMARY BANK
          ================================== */}

          <section
            className="
              fb-card
              p-6
              sm:p-7
            "
          >

            <div className="flex items-start gap-4">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#dcebd8]
                  text-[#375b32]
                "
              >
                <Building2 size={20} />
              </div>

              <div>

                <h2
                  className="
                    text-xl
                    font-semibold
                    tracking-[-0.025em]
                  "
                >
                  Primary bank
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-black/40
                  "
                >
                  Select the bank you primarily use.
                  FINBRIDGE will prioritize relevant
                  schemes and offers from this bank.
                </p>

              </div>

            </div>

            <div className="mt-6 max-w-xl">

              <label
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-black/40
                "
              >
                Your primary bank

                <select
                  className="
                    field
                    mt-2
                    cursor-pointer
                  "
                  value={
                    profile.primaryBank || ''
                  }
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      primaryBank:
                        event.target.value,
                    })
                  }
                >
                  <option value="">
                    Select your bank
                  </option>

                  <option value="HDFC Bank">
                    HDFC Bank
                  </option>

                  <option value="State Bank of India">
                    State Bank of India
                  </option>

                  <option value="ICICI Bank">
                    ICICI Bank
                  </option>

                  <option value="Axis Bank">
                    Axis Bank
                  </option>

                  <option value="Punjab National Bank">
                    Punjab National Bank
                  </option>

                  <option value="Bank of Baroda">
                    Bank of Baroda
                  </option>

                  <option value="Canara Bank">
                    Canara Bank
                  </option>

                  <option value="Kotak Mahindra Bank">
                    Kotak Mahindra Bank
                  </option>

                  <option value="IndusInd Bank">
                    IndusInd Bank
                  </option>

                  <option value="Union Bank of India">
                    Union Bank of India
                  </option>

                  <option value="IDBI Bank">
                    IDBI Bank
                  </option>

                  <option value="Bank of India">
                    Bank of India
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </label>

            </div>

            {profile.primaryBank && (
              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-[#dcebd8]
                  bg-[#f3f8f1]
                  p-4
                "
              >

                <div
                  className="
                    mt-0.5
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    bg-[#375b32]
                  "
                />

                <p
                  className="
                    text-xs
                    leading-5
                    text-[#375b32]
                  "
                >
                  FINBRIDGE will prioritize
                  {` ${profile.primaryBank} `}
                  when showing nearby banking schemes
                  and offers.
                </p>

              </div>
            )}

          </section>

          {/* =================================
              DISABILITY
          ================================== */}

          <section className="fb-card p-6">

            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-4
              "
            >

              <input
                type="checkbox"
                className="
                  h-5
                  w-5
                  accent-[#375b32]
                "
                checked={
                  Boolean(
                    profile.disabilityStatus
                  )
                }
                onChange={(event) =>
                  setProfile({
                    ...profile,

                    disabilityStatus:
                      event.target.checked,
                  })
                }
              />

              <div>

                <p className="text-sm font-semibold">
                  Disability status
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-black/40
                  "
                >
                  This may affect eligibility for
                  certain scholarship categories.
                </p>

              </div>

            </label>

          </section>

          {/* =================================
              SAVE AREA
          ================================== */}

          <div
            className="
              flex
              flex-col
              gap-3
              rounded-2xl
              border
              border-black/[0.08]
              bg-transparent
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="min-h-5">

              {saved && (
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#375b32]
                  "
                >
                  Profile saved successfully.
                </p>
              )}

            </div>

            <button
              className="
                btn-primary
                w-full
                sm:w-auto
              "
              type="submit"
              disabled={saving}
            >

              <Save size={16} />

              {saving
                ? 'Saving...'
                : 'Save profile'}

            </button>

          </div>

        </div>

      </form>
    </PageShell>
  );
}