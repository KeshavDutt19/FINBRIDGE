import { useState } from 'react';

import {
  UserRound,
  GraduationCap,
  Wallet,
  Target,
  Save,
} from 'lucide-react';

import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const fields = [
  ['age', 'Age', 'number'],
  ['state', 'State'],
  ['city', 'City'],
  ['gender', 'Gender'],
  ['category', 'Category'],

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

  ['yearOfStudy', 'Year of study'],

  [
    'annualFamilyIncome',
    'Annual family income',
    'number',
  ],

  [
    'employmentStatus',
    'Employment status',
  ],

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
];

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

    try {
      await updateProfile(profile);
      setSaved(true);

      setTimeout(
        () => setSaved(false),
        2500
      );
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
        ['yearOfStudy', 'Year of study'],
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
                className="fb-card p-6 sm:p-7"
                key={title}
              >

                <div className="
                  flex
                  items-start
                  gap-4
                ">

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
                    "
                  >
                    <Icon size={20} />
                  </div>

                  <div>

                    <h2 className="
                      text-xl
                      font-semibold
                      tracking-[-0.025em]
                    ">
                      {title}
                    </h2>

                    <p className="
                      mt-1
                      text-sm
                      leading-6
                      text-black/40
                    ">
                      {description}
                    </p>

                  </div>

                </div>

                <div className="
                  mt-6
                  grid
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                ">

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
                                  ? Number(
                                      event.target.value
                                    )
                                  : event.target.value,
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

          {/* Disability */}

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
                className="h-5 w-5 accent-[#375b32]"
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

                <p className="
                  mt-1
                  text-xs
                  text-black/40
                ">
                  This may affect eligibility for
                  certain scholarship categories.
                </p>

              </div>

            </label>

          </section>

          <div className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <div>
              {saved && (
                <p className="
                  text-sm
                  font-semibold
                  text-[#375b32]
                ">
                  Profile saved successfully.
                </p>
              )}
            </div>

            <button
              className="btn-primary"
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