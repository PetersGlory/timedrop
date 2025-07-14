
import {
  Card,
  CardContent,
} from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Use</h1>
        <p className="text-muted-foreground mt-2">
          These terms are effective as of {new Date().toLocaleDateString()}.
        </p>
      </header>
      <Card>
        <CardContent className="p-6 space-y-6 text-card-foreground">
            <p>
                Timedrop provides a personalized service that allows our members to
                access content over the Internet. These Terms of Use
                govern your use of our service. As used in these Terms of Use,
                "Timedrop service", "our service" or "the service" means the
                personalized service provided by Timedrop for discovering and
                accessing Timedrop content, including all features and
                functionalities, recommendations and reviews, our websites, and user
                interfaces, as well as all content and software associated with our
                service. References to ‘you’ in these Terms of Use indicate the
                member who created the Timedrop account and whose payment method is
                charged.
            </p>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">1. Membership</h2>
                <p>
                Your Timedrop membership will continue until terminated. To use the
                Timedrop service you must have Internet access and provide us with
                one or more Payment Methods. “Payment Method” means a current,
                valid, accepted method of payment, as may be updated from time to
                time, and which may include payment through your account with a
                third party.
                </p>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">2. Payment Methods</h2>
                <p>
                To use the Timedrop service you must provide one or more Payment
                Methods. You authorize us to charge any Payment Method associated
                to your account in case your primary Payment Method is declined or
                no longer available to us for payment of your subscription fee. You
                remain responsible for any uncollected amounts. If a payment is not
                successfully settled, due to expiration, insufficient funds, or
                otherwise, and you do not cancel your account, we may suspend your
                access to the service until we have successfully charged a valid
                Payment Method.
                </p>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">3. Passwords and Account Access</h2>
                <p>
                You are responsible for any activity that occurs through the
                Timedrop account. By allowing others to access the account, you
                agree that such individuals are acting on your behalf and that you
                are bound by any changes that they may make to the account,
                including but not limited to changes to the subscription plan. To
                help maintain control over the account and to prevent any
                unauthorized users from accessing the account, you should maintain
                control over the devices that are used to access the service and not
                reveal the password or details of the Payment Method associated
                with the account to anyone. You agree to provide and maintain
                accurate information relating to your account, including valid

                contact information so we can send you account related notices. We
                can terminate your account or place your account on hold in order to
                protect you, Timedrop or our partners from identity theft or other
                fraudulent activity.
                </p>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">4. Warranties and Limitations on Liability</h2>
                <p>
                The Timedrop service is provided "as is" and without warranty or
                condition. In particular, our service may not be uninterrupted or
                error-free. You waive all special, indirect and consequential
                damages against us. These terms will not limit any non-waivable
                warranties or consumer protection rights that you may be entitled to
                under the mandatory laws of your country of residence.
                </p>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">5. Changes to Terms of Use and Assignment</h2>
                <p>
                Timedrop may, from time to time, change these Terms of Use. In
                case of material changes, we will notify you at least one month
                before such changes apply to you. We may assign or transfer our
                agreement with you including our associated rights and obligations
                at any time and you agree to cooperate with us in connection with
                such an assignment or transfer.
                </p>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">6. Electronic Communications</h2>
                <p>
                We will send you information relating to your account (e.g. payment
                authorizations, invoices, changes in password, confirmation
                messages, notices) in electronic form only.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
