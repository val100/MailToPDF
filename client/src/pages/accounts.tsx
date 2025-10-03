import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Mail, Clock, Settings2, Trash2, Edit, CheckCircle2, XCircle,
  Calendar, Timer, PlayCircle, Loader2
} from "lucide-react";

interface EmailAccount {
  id: string;
  name: string;
  emailAddress: string;
  accountType: string;
  isActive: boolean;
  checkingMode: string;
  intervalMinutes: number;
  dailyTime?: string;
  lastChecked?: string;
  lastCheckStatus?: string;
  createdAt: string;
}

interface AccountFormData {
  name: string;
  emailAddress: string;
  accountType: string;
  checkingMode: string;
  intervalMinutes: number;
  dailyTime?: string;
  isActive: boolean;
}

export default function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm<AccountFormData>({
    defaultValues: {
      name: "",
      emailAddress: "",
      accountType: "office365",
      checkingMode: "interval",
      intervalMinutes: 10,
      dailyTime: "09:00",
      isActive: true,
    },
  });

  // Fetch accounts
  const { data: accounts = [], isLoading } = useQuery<EmailAccount[]>({
    queryKey: ['/api/accounts'],
    refetchInterval: 30000,
  });

  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      return await apiRequest('POST', '/api/accounts', data);
    },
    onSuccess: () => {
      toast({
        title: "Account Added",
        description: "Email account has been configured successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccountFormData> }) => {
      return await apiRequest('PATCH', `/api/accounts/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Account Updated",
        description: "Email account settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setEditingAccount(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/accounts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Email account has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/accounts/${id}/test`);
    },
    onSuccess: () => {
      toast({
        title: "Connection Successful",
        description: "Successfully connected to the email account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data });
    } else {
      addAccountMutation.mutate(data);
    }
  };

  const handleEdit = (account: EmailAccount) => {
    setEditingAccount(account);
    setValue('name', account.name);
    setValue('emailAddress', account.emailAddress);
    setValue('accountType', account.accountType);
    setValue('checkingMode', account.checkingMode);
    setValue('intervalMinutes', account.intervalMinutes);
    setValue('dailyTime', account.dailyTime || '09:00');
    setValue('isActive', account.isActive);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingAccount(null);
    reset();
  };

  const checkingMode = watch('checkingMode');

  return (
    <div className="flex-1 overflow-auto" data-testid="accounts-page">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Email Accounts</h2>
            <p className="text-muted-foreground">
              Connect your email accounts (Step 1: Adding your first account)
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-account">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? 'Edit Email Account' : 'Add Email Account'}
                </DialogTitle>
                <DialogDescription>
                  Configure your email account and scheduling settings
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Account Details</TabsTrigger>
                    <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                  </TabsList>

                  {/* Account Details Tab */}
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Account Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., My Office 365 Account"
                        {...register("name", { required: true })}
                        data-testid="input-account-name"
                      />
                      <p className="text-sm text-muted-foreground">
                        Display name for this account in the application
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailAddress">Email Address *</Label>
                      <Input
                        id="emailAddress"
                        type="email"
                        placeholder="user@company.com"
                        {...register("emailAddress", { required: true })}
                        data-testid="input-email-address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountType">Email Provider *</Label>
                      <Select
                        value={watch('accountType')}
                        onValueChange={(value) => setValue('accountType', value)}
                      >
                        <SelectTrigger data-testid="select-account-type">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office365">Office 365 / Exchange</SelectItem>
                          <SelectItem value="gmail">Gmail</SelectItem>
                          <SelectItem value="imap">IMAP (Generic)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        For Office 365/Gmail, modern authentication will be used
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={watch('isActive')}
                        onCheckedChange={(checked) => setValue('isActive', checked)}
                        data-testid="switch-is-active"
                      />
                      <Label htmlFor="isActive">Enable this account</Label>
                    </div>
                  </TabsContent>

                  {/* Scheduling Tab */}
                  <TabsContent value="scheduling" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkingMode">Check Interval *</Label>
                      <Select
                        value={watch('checkingMode')}
                        onValueChange={(value) => setValue('checkingMode', value)}
                      >
                        <SelectTrigger data-testid="select-checking-mode">
                          <SelectValue placeholder="Select checking mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interval">Every X Minutes</SelectItem>
                          <SelectItem value="daily">Daily at Specific Time</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                          <SelectItem value="advanced">Advanced Scheduler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {checkingMode === 'interval' && (
                      <div className="space-y-2">
                        <Label htmlFor="intervalMinutes">Check Every (Minutes)</Label>
                        <Input
                          id="intervalMinutes"
                          type="number"
                          min="1"
                          {...register("intervalMinutes", { valueAsNumber: true })}
                          data-testid="input-interval-minutes"
                        />
                        <p className="text-sm text-muted-foreground">
                          Check for new emails every X minutes (recommended: 5-30 minutes)
                        </p>
                      </div>
                    )}

                    {checkingMode === 'daily' && (
                      <div className="space-y-2">
                        <Label htmlFor="dailyTime">Time of Day</Label>
                        <Input
                          id="dailyTime"
                          type="time"
                          {...register("dailyTime")}
                          data-testid="input-daily-time"
                        />
                        <p className="text-sm text-muted-foreground">
                          Check for new emails once per day at this time
                        </p>
                      </div>
                    )}

                    {checkingMode === 'manual' && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">
                            This account will only be checked when you manually trigger it.
                            No automatic scheduling will be applied.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {checkingMode === 'advanced' && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">
                            Advanced scheduler allows you to specify specific days and time ranges.
                            This feature will be configured after adding the account.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addAccountMutation.isPending || updateAccountMutation.isPending}
                    data-testid="button-save-account"
                  >
                    {(addAccountMutation.isPending || updateAccountMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingAccount ? 'Update Account' : 'Add Account'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Email Accounts</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by connecting your first email account.
                <br />
                Automatic Email Manager will check for new emails and process them based on your scenarios.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-account">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Checking Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} data-testid={`row-account-${account.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {account.name}
                      </div>
                    </TableCell>
                    <TableCell>{account.emailAddress}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.accountType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {account.checkingMode === 'interval' && (
                          <>
                            <Timer className="w-4 h-4" />
                            Every {account.intervalMinutes} min
                          </>
                        )}
                        {account.checkingMode === 'daily' && (
                          <>
                            <Calendar className="w-4 h-4" />
                            Daily at {account.dailyTime}
                          </>
                        )}
                        {account.checkingMode === 'manual' && (
                          <>
                            <PlayCircle className="w-4 h-4" />
                            Manual
                          </>
                        )}
                        {account.checkingMode === 'advanced' && (
                          <>
                            <Clock className="w-4 h-4" />
                            Advanced
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.isActive ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {account.lastChecked ? new Date(account.lastChecked).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testConnectionMutation.mutate(account.id)}
                          disabled={testConnectionMutation.isPending}
                          data-testid={`button-test-${account.id}`}
                        >
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(account)}
                          data-testid={`button-edit-${account.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this account?')) {
                              deleteAccountMutation.mutate(account.id);
                            }
                          }}
                          data-testid={`button-delete-${account.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
