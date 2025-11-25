import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, RefreshCw, ArrowRight } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Get email from session or localStorage
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
        if (session.user.email_confirmed_at) {
          navigate("/");
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email not found. Please sign up again.");
      navigate("/auth");
      return;
    }

    // Rate limiting - prevent spam
    const lastResend = localStorage.getItem('lastResendTime');
    if (lastResend) {
      const timeDiff = Date.now() - parseInt(lastResend);
      if (timeDiff < 60000) { // 1 minute
        toast.error("Please wait before requesting another email");
        return;
      }
    }

    setIsResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    setIsResending(false);

    if (error) {
      toast.error(error.message);
    } else {
      localStorage.setItem('lastResendTime', Date.now().toString());
      toast.success("Verification email sent! Check your inbox.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    setIsVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    setIsVerifying(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email verified successfully!");
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-4 bg-gradient-to-br from-primary to-accent rounded-full w-20 h-20 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription className="text-base">
            📩 We've sent a verification link and code to:
            <br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Click the link in your email, or enter the 6-digit code below:
              </p>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button 
              onClick={handleVerifyOtp} 
              className="w-full"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full"
            >
              Log Out
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or resend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
