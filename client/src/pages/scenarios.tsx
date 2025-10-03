import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Trash2, Edit, CheckCircle2, XCircle, Loader2, GitBranch,
  Filter, Zap, Copy, AlertCircle, Settings2, PlayCircle
} from "lucide-react";
import type { Scenario, InsertScenario } from "@shared/schema";

interface ScenarioWithCounts extends Omit<Scenario, 'actions'> {
  conditionsCount: number;
  actionsCount: number;
}

interface ScenarioCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  useAndOperator: boolean;
  orderIndex: number;
}

interface ScenarioFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export default function Scenarios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ScenarioWithCounts | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm<ScenarioFormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Fetch scenarios
  const { data: scenarios = [], isLoading } = useQuery<ScenarioWithCounts[]>({
    queryKey: ['/api/scenarios'],
    refetchInterval: 30000,
  });

  // Fetch conditions for selected scenario
  const { data: conditions = [] } = useQuery<ScenarioCondition[]>({
    queryKey: ['/api/scenarios', selectedScenario, 'conditions'],
    enabled: !!selectedScenario,
  });

  // Add scenario mutation
  const addScenarioMutation = useMutation({
    mutationFn: async (data: InsertScenario) => {
      return await apiRequest('POST', '/api/scenarios', data);
    },
    onSuccess: () => {
      toast({
        title: "Scenario Created",
        description: "New scenario has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
      setIsAddDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Scenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update scenario mutation
  const updateScenarioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertScenario> }) => {
      return await apiRequest('PATCH', `/api/scenarios/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Scenario Updated",
        description: "Scenario settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
      setEditingScenario(null);
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete scenario mutation
  const deleteScenarioMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/scenarios/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Scenario Deleted",
        description: "Scenario has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Duplicate scenario mutation
  const duplicateScenarioMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/scenarios/${id}/duplicate`);
    },
    onSuccess: () => {
      toast({
        title: "Scenario Duplicated",
        description: "A copy of the scenario has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios'] });
    },
    onError: (error) => {
      toast({
        title: "Duplicate Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScenarioFormData) => {
    if (editingScenario) {
      // For updates, only send the fields that changed (don't overwrite actions)
      const updatePayload: Partial<InsertScenario> = {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      };
      updateScenarioMutation.mutate({ id: editingScenario.id, data: updatePayload });
    } else {
      // For new scenarios, include all required fields
      const createPayload: InsertScenario = {
        ...data,
        actions: [], // Default empty actions array (will be configured later)
        userId: 'default-user', // TODO: Get from auth context
      };
      addScenarioMutation.mutate(createPayload);
    }
  };

  const handleEdit = (scenario: ScenarioWithCounts) => {
    setEditingScenario(scenario);
    setValue('name', scenario.name);
    setValue('description', scenario.description || '');
    setValue('isActive', scenario.isActive);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingScenario(null);
    reset();
  };

  const handleEditConditionsAndActions = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    // This would open a detailed conditions/actions editor
    // For now, we'll show a toast
    toast({
      title: "Configure Scenario",
      description: "Conditions and Actions editor will open here. Navigate to Settings to configure all actions.",
    });
  };

  return (
    <div className="flex-1 overflow-auto" data-testid="scenarios-page">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Scenarios</h2>
            <p className="text-muted-foreground">
              Create scenarios with conditions and actions (similar to Automatic Email Manager)
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-scenario">
              <Plus className="w-4 h-4 mr-2" />
              New Scenario
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
                </DialogTitle>
                <DialogDescription>
                  Define a scenario that will process emails based on conditions
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Scenario Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Process Orders from Shopify"
                    {...register("name", { required: true })}
                    data-testid="input-scenario-name"
                  />
                  <p className="text-sm text-muted-foreground">
                    Give your scenario a descriptive name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this scenario does..."
                    rows={3}
                    {...register("description")}
                    data-testid="textarea-scenario-description"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    data-testid="switch-scenario-active"
                  />
                  <Label htmlFor="isActive">Enable this scenario</Label>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Next Steps:</p>
                  <p className="text-sm text-muted-foreground">
                    After creating the scenario, you'll be able to add:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Conditions (rules to filter emails)</li>
                    <li>Actions (what to do with matching emails)</li>
                    <li>Advanced scheduler (specific days/times)</li>
                  </ul>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addScenarioMutation.isPending || updateScenarioMutation.isPending}
                    data-testid="button-save-scenario"
                  >
                    {(addScenarioMutation.isPending || updateScenarioMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingScenario ? 'Update Scenario' : 'Create Scenario'}
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
        ) : scenarios.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GitBranch className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scenarios Yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Scenarios let you automatically process emails based on conditions.
                <br />
                Create your first scenario to start automating email workflows.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-scenario">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Scenario
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} data-testid={`card-scenario-${scenario.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{scenario.name}</CardTitle>
                          {scenario.isActive ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {scenario.description && (
                          <CardDescription>{scenario.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditConditionsAndActions(scenario.id)}
                          data-testid={`button-configure-${scenario.id}`}
                        >
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateScenarioMutation.mutate(scenario.id)}
                          disabled={duplicateScenarioMutation.isPending}
                          data-testid={`button-duplicate-${scenario.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(scenario)}
                          data-testid={`button-edit-${scenario.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this scenario?')) {
                              deleteScenarioMutation.mutate(scenario.id);
                            }
                          }}
                          data-testid={`button-delete-${scenario.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {scenario.conditionsCount || 0} Condition{scenario.conditionsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {scenario.actionsCount || 0} Action{scenario.actionsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {scenario.conditionsCount === 0 && scenario.actionsCount === 0 && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                              Configuration Required
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                              Add conditions and actions to complete this scenario setup.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConditionsAndActions(scenario.id)}
                        data-testid={`button-edit-rules-${scenario.id}`}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Edit Conditions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConditionsAndActions(scenario.id)}
                        data-testid={`button-edit-actions-${scenario.id}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Edit Actions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scenario Processing Order</CardTitle>
                <CardDescription>
                  Scenarios are processed in the order shown above. Drag to reorder (coming soon).
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
